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
const findMember = async (id, roomID) => {
  const players = await client.SMEMBERS('room_' + roomID);
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerParsed = JSON.parse(player);
    if(playerParsed.id === id)
      return player;
  }
}

const createRoom = async (id, username) => {
  // Create a unique 6 digit room id
  const roomID = await createID();
  // Update redis
  const players = {id, username, isHost: true, isReady: true};
  client.SADD('room_' + roomID, JSON.stringify(players));
  client.set('user_' + id, roomID);
  // Emit message
  return { roomCreated: { roomID, players: [players] } };
}

const joinRoom = async (id, msg) => {
  const { roomID, username } = msg;

  // Check if room exist, if not emit error message
  let players = await client.SMEMBERS('room_' + roomID);
  if(!players)
    return {personMsg: {roomNotFound: true}};
  
  let parsedPlayers = [];
  for (let i = 0; i < players.length; i++) {
    parsedPlayers.push(JSON.parse(players[i]));
  }
  
  // Update room data in redis
  const newUser = {id, username, isHost: false, isReady: false};
  parsedPlayers.push({id, username, isHost: false, isReady: false});
  client.SADD('room_' + roomID, JSON.stringify(newUser));
  client.set('user_' + id, roomID);

  // Emit messages
  return {
    personMsg: {joined: {players: parsedPlayers}},
    roomMsg: {join: { id, username: msg.username, isReady: false, isHost: false }}
  };
}

const toggleReady = async (id, msg) => {
  const { roomID, isReady } = msg;

  // Get unparsed data of players
  const player = await findMember(id, roomID);

  // Change isReady property
  const playerParsed = JSON.parse(player);
  playerParsed.isReady = isReady;

  // Remove from set
  await client.SREM('room_' + roomID, player);

  // Add to set again
  client.SADD('room_' + roomID, JSON.stringify(playerParsed));

  return { ready: { id, isReady } };
}

const leaveRoom = async (id) => {
  // Check if he has room
  const roomID = await client.get('user_' + id);
  if(!roomID) 
    return { isHost: false, hasRoom: false };

  // Get unparsed player data from set
  const player = await findMember(id, roomID);

  if(!player)
    return { isHost: false, hasRoom: false };

  // Parse player data then remove it from set
  const playerParsed = JSON.parse(player);
  const isHost = playerParsed.isHost;
  await client.SREM('room_' + roomID, player);

  // Clear redis user data
  client.DEL('user_' + id);

  let roomMsg = { disconnect: { id } };
  let newHost = '';

  // If host, set a new host
  if(isHost) {
    // Get a random player
    newHost = await client.SRANDMEMBER('room_'+ roomID);
    // Remove him from set
    await client.SREM('room_' + roomID, newHost);
    // Change some properties
    newHost = JSON.parse(newHost);
    newHost.isHost = true;
    newHost.isReady = true;
    // Add to set again
    client.SADD('room_' + roomID, JSON.stringify(newHost));
    roomMsg.newHost = { id: newHost.id };
  }
  return { hasRoom: true, isHost, newHost: newHost.id, roomID, roomMsg };
}

module.exports = { createRoom, joinRoom, toggleReady, leaveRoom };