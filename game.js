const cells = document.querySelectorAll('.cell');
const exitBtn = document.getElementById('exitBtn');
let roomID;
let currentPlayer = 'X';

// Handle move from the other player
socket.on('move', (move) => {
    const cell = document.querySelector(`.cell[data-index="${move.index}"]`);
    cell.textContent = move.player;
    cell.classList.add('disabled');
    switchPlayer();
});

// Handle game over
socket.on('gameOver', () => {
    alert('ゲームが終了しました');
    exitBtn.style.display = 'block';
});

// When a cell is clicked
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.textContent === '') {
            const index = cell.dataset.index;
            cell.textContent = currentPlayer;
            cell.classList.add('disabled');
            socket.emit('move', roomID, { index, player: currentPlayer });

            if (checkWinner()) {
                socket.emit('gameOver', roomID);
            } else {
                switchPlayer();
            }
        }
    });
});

// Exit button - return to lobby
exitBtn.addEventListener('click', () => {
    location.reload();
});

// Switch between players
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// Check for a winning pattern
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => {
            return cells[index].textContent === currentPlayer;
        });
    });
}
