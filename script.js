// public/script.js
const ws = new WebSocket('ws://localhost:3000');

// WebSocket接続成功時
ws.onopen = () => {
  console.log('Connected to WebSocket server');
};

// サーバーからのメッセージ受信
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received message:', data);

  switch (data.type) {
    case 'roomCreated':
      console.log(`Room created with ID: ${data.roomID}`);
      break;

    case 'startGame':
      console.log(`Game started. Your symbol is: ${data.symbol}`);
      break;

    case 'moveMade':
      console.log(`Move made at index ${data.index} by player ${data.symbol}`);
      break;

    case 'gameEnd':
      console.log(`Game ended with result: ${data.result}`);
      break;

    case 'error':
      console.error(`Error: ${data.message}`);
      break;
  }
};

// メッセージをサーバーに送信する関数
function createRoom() {
  ws.send(JSON.stringify({ type: 'createRoom' }));
}

function joinRoom(roomID) {
  ws.send(JSON.stringify({ type: 'joinRoom', roomID }));
}

function makeMove(index) {
  ws.send(JSON.stringify({ type: 'makeMove', index }));
}

// WebSocket切断時
ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
};
