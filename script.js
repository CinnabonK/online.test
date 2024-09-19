const socket = io();

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomIDInput = document.getElementById('roomIDInput');
const errorDiv = document.getElementById('error');

createRoomBtn.addEventListener('click', () => {
    socket.emit('createRoom');
});

joinRoomBtn.addEventListener('click', () => {
    const roomID = roomIDInput.value.trim();
    if (roomID) {
        socket.emit('joinRoom', roomID);
    } else {
        displayError('ルームIDを入力してください');
    }
});

socket.on('roomCreated', (roomID) => {
    startGame(roomID);
});

socket.on('startGame', (roomID) => {
    startGame(roomID);
});

socket.on('error', (message) => {
    displayError(message);
});

function startGame(roomID) {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('roomIDDisplay').textContent = roomID;
}

function displayError(message) {
    errorDiv.textContent = message;
    setTimeout(() => {
        errorDiv.textContent = '';
    }, 3000);
}
