// Redis client
const { client } = require('../config/redis');

const createID = async () => {
  let isUnique = false;
  const chars = ['1','2','3','4','5','6','7','8','9'];
  let id = '';
  while(!isUnique) {
    for (let i = 0; i < 6; i++) 
      id += chars[Math.floor(Math.random() * 9)];
    if(!await client.get('room_' + id))
      return id;
    else
      return '';
  }
}

const createRoom = async (id, username) => {
  // Create a unique 6 digit room id
  const roomID = await createID();
  // Update redis
  const players = [{id, username, isHost: true, isReady: true}];
  client.set('room_' + roomID, JSON.stringify(players));
  client.set('user_' + id, roomID);
  // Emit message
  return { roomCreated: { roomID, players } };
}

const joinRoom = async (id, msg) => {
  const { roomID, username } = msg;

  // Check if room exist, if not emit error message
  let players = await client.get('room_' + roomID);
  if(!players)
    return {personMsg: {roomNotFound: true}};
  
  // Update room data in redis
  players = JSON.parse(players);
  players.push({id, username, isHost: false, isReady: false});
  client.set('room_' + roomID, JSON.stringify(players));
  client.set('user_' + id, roomID);
  // Emit messages
  return {
    personMsg: {joined: {players}},
    roomMsg: {join: { id, username: msg.username, isReady: false, isHost: false }}
  };
}

const toggleReady = async (id, msg) => {
  const { roomID, isReady } = msg;
  // Get room of the user and find his index 
  let roomData = JSON.parse(await client.get('room_' + roomID));
  const index = roomData.findIndex(x => x.id == id);
  // Toggle ready property
  roomData[index].isReady = isReady;
  // Update redis
  client.set('room_' + roomID, JSON.stringify(roomData));
  // Emit message
  return { ready: { id, isReady } };
}

const leaveRoom = async (id) => {
  // Check if he has room
  const roomID = await client.get('user_' + id);
  if(!roomID) 
    return { isHost: false, hasRoom: false };

  // Get room of the user and find its index 
  let roomData = JSON.parse(await client.get('room_' + roomID));
  const index = roomData.findIndex(x => x.id == id);
  // Get if he is host or not
  const isHost = roomData[index].isHost;
  // Remove him from roomData
  if (index > -1)
    roomData.splice(index, 1);

  // Clear redis user data
  client.DEL('user_' + id);
  if(roomData.length == 0) {
    client.DEL('room_' + roomID);
    return { isHost: false, hasRoom: false };
  }

  // to return;
  let roomMsg = { disconnect: { id } };
  let newHost = '';

  // If host, set a new host
  if(isHost) {
    roomData[0].isHost = true;
    roomData[0].isReady = true; // Host is ready anytime
    newHost = roomData[0].id;
    roomMsg.newHost = { id: newHost };
  }

  // Update redis room data
  client.set('room_' + roomID, JSON.stringify(roomData));
  return { hasRoom: true, isHost, newHost, roomID, roomMsg };
}

module.exports = { createRoom, joinRoom, toggleReady, leaveRoom };