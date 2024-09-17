const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const app = express();

// CORSを有効にする
app.use(cors());
app.use(express.static('public')); // 'public'フォルダ内の静的ファイルを提供

// サーバーの作成
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ポート3000でサーバーをリッスン
server.listen(3000, '0.0.0.0', () => {
  console.log('Server is listening on port 3000');
});

// ルーム管理用
let rooms = {};

// WebSocket接続時の処理
wss.on('connection', (ws) => {
  let roomID = null;
  let playerSymbol = null;

  // クライアントからのメッセージ受信
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'createRoom':
        roomID = generateRoomID();
        rooms[roomID] = { players: [ws], gameState: Array(9).fill(null) };
        playerSymbol = 'O';  // ルーム作成者は "O"
        ws.send(JSON.stringify({ type: 'roomCreated', roomID }));
        break;

      case 'joinRoom':
        roomID = data.roomID;
        if (rooms[roomID] && rooms[roomID].players.length < 2) {
          playerSymbol = 'X';  // 2人目のプレイヤーは "X"
          rooms[roomID].players.push(ws);
          startGame(roomID);
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'ルームが満員または存在しません' }));
        }
        break;

      case 'makeMove':
        if (rooms[roomID]) {
          const { gameState } = rooms[roomID];
          if (gameState[data.index] === null) {
            gameState[data.index] = playerSymbol;
            broadcastMove(roomID, data.index, playerSymbol);
            checkGameEnd(roomID);
          }
        }
        break;

      case 'exitGame':
        exitRoom(roomID, ws);
        break;
    }
  });

  // クライアントが切断された時の処理
  ws.on('close', () => {
    exitRoom(roomID, ws);
  });
});

// ルームIDの生成
function generateRoomID() {
  return Math.random().toString(36).substring(2, 9);
}

// ゲーム開始時にプレイヤーに通知
function startGame(roomID) {
  rooms[roomID].players.forEach((player, index) => {
    const symbol = index === 0 ? 'O' : 'X';
    player.send(JSON.stringify({ type: 'startGame', symbol }));
  });
}

// ゲームの状態をすべてのプレイヤーに送信
function broadcastMove(roomID, index, symbol) {
  rooms[roomID].players.forEach(player => {
    player.send(JSON.stringify({ type: 'moveMade', index, symbol }));
  });
}

// ゲーム終了の判定
function checkGameEnd(roomID) {
  const { gameState } = rooms[roomID];
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (const [a, b, c] of winningCombinations) {
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      broadcastGameEnd(roomID, gameState[a]);
      return;
    }
  }

  if (gameState.every(cell => cell !== null)) {
    broadcastGameEnd(roomID, 'draw');
  }
}

// 勝者通知
function broadcastGameEnd(roomID, result) {
  rooms[roomID].players.forEach(player => {
    player.send(JSON.stringify({ type: 'gameEnd', result }));
  });
}

// ルームからの退出処理
function exitRoom(roomID, ws) {
  if (roomID && rooms[roomID]) {
    rooms[roomID].players = rooms[roomID].players.filter(player => player !== ws);
    if (rooms[roomID].players.length === 0) {
      delete rooms[roomID];
    }
  }
}
