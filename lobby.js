const socket = io();

// HTML elements
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomIDInput = document.getElementById('roomIDInput');
const roomIDDisplay = document.getElementById('roomIDDisplay');
const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const errorDiv = document.getElementById('error');

// When the "Create Room" button is clicked
createRoomBtn.addEventListener('click', () => {
    socket.emit('createRoom');
});

// When the "Join Room" button is clicked
joinRoomBtn.addEventListener('click', () => {
    const roomID = roomIDInput.value.trim();
    if (roomID) {
        socket.emit('joinRoom', roomID);
    } else {
        errorDiv.textContent = 'ルームIDを入力してください';
    }
});

// When the room is created
socket.on('roomCreated', (roomID) => {
    roomIDDisplay.textContent = roomID;
    switchToGame();
});

// When the game starts
socket.on('startGame', (roomID) => {
    roomIDDisplay.textContent = roomID;
    switchToGame();
});

// Show error messages
socket.on('error', (message) => {
    errorDiv.textContent = message;
});

// Switch from lobby to game view
function switchToGame() {
    lobby.style.display = 'none';
    game.style.display = 'block';
}
