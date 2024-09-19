const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};  // ルーム情報を保持

// 静的ファイルの提供
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`ユーザーが接続しました: ${socket.id}`);

  socket.on('createRoom', () => {
    const roomID = generateRoomID();
    rooms[roomID] = [socket.id];
    socket.join(roomID);
    socket.emit('roomCreated', roomID);
  });

  socket.on('joinRoom', (roomID) => {
    if (rooms[roomID] && rooms[roomID].length < 2) {
      rooms[roomID].push(socket.id);
      socket.join(roomID);
      io.to(roomID).emit('startGame', roomID);
    } else {
      socket.emit('error', 'ルームに参加できません');
    }
  });

  socket.on('move', (roomID, move) => {
    socket.to(roomID).emit('move', move);
  });

  socket.on('gameOver', (roomID) => {
    io.to(roomID).emit('gameOver');
    delete rooms[roomID];
  });

  socket.on('disconnect', () => {
    console.log(`ユーザーが切断しました: ${socket.id}`);
    // ルームからユーザーを削除
    for (let roomID in rooms) {
      rooms[roomID] = rooms[roomID].filter(id => id !== socket.id);
      if (rooms[roomID].length === 0) {
        delete rooms[roomID];
      }
    }
  });
});

const generateRoomID = () => {
  return Math.random().toString(36).substr(2, 5);
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーが起動しました。ポート: ${PORT}`);
});
