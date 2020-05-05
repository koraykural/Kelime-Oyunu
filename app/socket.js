/*
* This file initializes socket.io
* All of the io operations occurs here
* ./socket.lobby provides functions for lobby operations
* ./socket.game provides functions for game itself
*/

const { createRoom, joinRoom, toggleReady, leaveRoom } = require('./socket.lobby');
const { startGame, answerQuestion } = require('./socket.game');

const init = (io) => {
  io.on('connection', (socket) => {
  
    socket.on('NewRoom', async (username) => {
      const personMsg = await createRoom(socket.id, username);
      // Give room id
      io.emit(socket.id, personMsg);
    });

    socket.on('JoinRoom', async (msg) => {
      const { personMsg, roomMsg } = await joinRoom(socket.id, msg);
      // Give error or room info
      io.emit(socket.id, personMsg);
      if(roomMsg)
        // Inform about the new player
        io.emit(msg.roomID, roomMsg);
    });

    socket.on('Ready', async (msg) => {
      const roomMsg = await toggleReady(socket.id, msg);
      // Inform room
      io.emit(msg.roomID, roomMsg);
    })

    socket.on('Start', async (roomID) => {
      const roomMsg = await startGame(roomID);
      io.emit(roomID, roomMsg);
    })

    socket.on('Answer', async msg => {
      const roomMsg = await answerQuestion(socket.id, msg)
      io.emit(msg.roomID, roomMsg);
    })

    socket.on('disconnect', async () => {
      const { hasRoom, isHost, roomMsg, roomID } = await leaveRoom(socket.id);
      // Inform room (if had)
      if(hasRoom)
        io.emit(roomID, roomMsg);
    });
  });
}

module.exports = { init };