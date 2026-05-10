// EXO Puzzle Game Logic

const BOARD_SIZE = 8;
const COLORS = ['white', 'red', 'black', 'brown', 'yellow'];
const LETTERS = ['E', 'X', 'O'];

let board = [];
let score = 0;
let combo = 0;
let lastPlacementCleared = false;
let gameOver = false;
let nextBlock = null;

const boardElement = document.getElementById('board');
const scoreElement = document.getElementById('score');
const comboElement = document.getElementById('combo');
const nextLetterElement = document.getElementById('next-letter');
const resetBtn = document.getElementById('reset-btn');
const gameOverElement = document.getElementById('game-over');

// Initialize the game
function initGame() {
    board = [];
    score = 0;
    combo = 0;
    gameOver = false;
    updateScore();
    updateCombo();
    createBoard();
    generateNextBlock();
    renderBoard();
    gameOverElement.style.display = 'none';
}

// Create the board array (empty)
function createBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = null;
        }
    }
}

// Get text color based on background color
function getTextColor(bgColor) {
    if (bgColor === 'white' || bgColor === 'yellow') {
        return 'black';
    }
    return 'white';
}

// Generate a random block
function generateRandomBlock() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return { color, letter };
}

// Generate next block
function generateNextBlock() {
    nextBlock = generateRandomBlock();
    updateNextBlockDisplay();
}

// Update next block display
function updateNextBlockDisplay() {
    nextLetterElement.textContent = nextBlock.letter;
    nextLetterElement.style.backgroundColor = nextBlock.color;
    nextLetterElement.style.color = getTextColor(nextBlock.color);
}

function setDropDistance(distance) {
    document.documentElement.style.setProperty('--drop-distance', distance + '%');
}

// Render the board to the DOM
function renderBoard(animate = false, newBlockPos = null) {
    boardElement.innerHTML = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            const block = board[row][col];
            if (block) {
                cell.textContent = block.letter;
                cell.style.backgroundColor = block.color;
                cell.style.color = getTextColor(block.color);
                cell.style.border = '1.5px solid #ccc';
            } else {
                cell.classList.add('empty');
            }
            cell.addEventListener('mouseenter', () => highlightColumn(col));
            cell.addEventListener('mouseleave', () => unhighlightColumn());
            cell.addEventListener('click', () => addBlockToColumn(col));
            boardElement.appendChild(cell);
        }
    }
    if (newBlockPos) {
        const [r, c] = newBlockPos;
        const index = r * BOARD_SIZE + c;
        const cell = boardElement.children[index];
        if (cell) {
            setDropDistance(r * -100);
            cell.classList.add('placed');
            setTimeout(() => cell.classList.remove('placed'), 300);
        }
    }
    if (animate) {
        requestAnimationFrame(() => {
            boardElement.querySelectorAll('.cell').forEach(cell => {
                cell.classList.add('falling');
                requestAnimationFrame(() => {
                    cell.classList.remove('falling');
                });
            });
        });
    }
}

// Highlight column on hover
function highlightColumn(col) {
    if (gameOver) return;
    document.querySelectorAll(`[data-col="${col}"]`).forEach(cell => {
        cell.classList.add('highlighted');
    });
}

// Unhighlight column
function unhighlightColumn() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

// Add block to selected column
function addBlockToColumn(col) {
    if (gameOver || !nextBlock) return;

    if (board[0][col] === null) {
        board[0][col] = nextBlock;
        applyGravity();
        // Find the final position after gravity
        let finalRow = -1;
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (board[r][col] === nextBlock) {
                finalRow = r;
                break;
            }
        }
        generateNextBlock();
        renderBoard(false, finalRow !== -1 ? [finalRow, col] : null);
        checkMatches(false);
    } else {
        // Game over if top is full
        gameOver = true;
        gameOverElement.style.display = 'block';
    }
}

// Check for matches and remove them
function checkMatches(isChain = false) {
    const matches = findMatches();
    if (matches.length > 0) {
        combo = lastPlacementCleared ? combo + 1 : 1;
        lastPlacementCleared = true;
        updateCombo();
        animateMatches(matches);
    } else if (!isChain) {
        combo = 0;
        lastPlacementCleared = false;
        updateCombo();
    }
}

function animateMatches(matches) {
    matches.forEach(([row, col]) => {
        const index = row * BOARD_SIZE + col;
        const cell = boardElement.children[index];
        if (cell) {
            cell.classList.add('matched');
        }
    });
    setTimeout(() => {
        // 매치된 블록 중 하나를 선택해서 살려두기
        let survivorPos = null;
        
        if (matches.length > 0) {
            const randomIndex = Math.floor(Math.random() * matches.length);
            survivorPos = matches[randomIndex];
        }
        
        // 모든 매치된 블록 제거
        removeMatches(matches);
        
        // 생존자 블록 복원
        if (survivorPos) {
            // 원래 있던 블록의 색상과 글자를 유지한 새 블록 생성
            const [row, col] = survivorPos;
            board[row][col] = generateRandomBlock();
        }
        
        applyGravity();
        addScore(matches.length, combo);
        renderBoard(true);
        
        // 연쇄 반응 확인
        setTimeout(() => {
            checkMatches(true);
        }, 400);
    }, 250);
}

// Get neighbors (up, down, left, right)
function getNeighbors(row, col) {
    const neighbors = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            neighbors.push([nr, nc]);
        }
    }
    return neighbors;
}

// BFS to find connected groups by same color
function findSameColorGroup(startRow, startCol, visited) {
    const key = `${startRow}-${startCol}`;
    if (visited.has(key) || !board[startRow][startCol]) {
        return [];
    }
    
    const startColor = board[startRow][startCol].color;
    const group = [];
    const queue = [[startRow, startCol]];
    visited.add(key);
    
    while (queue.length > 0) {
        const [row, col] = queue.shift();
        group.push([row, col]);
        
        for (const [nr, nc] of getNeighbors(row, col)) {
            const nkey = `${nr}-${nc}`;
            if (!visited.has(nkey) && board[nr][nc] && board[nr][nc].color === startColor) {
                visited.add(nkey);
                queue.push([nr, nc]);
            }
        }
    }
    
    return group;
}

// BFS to find connected groups by same letter
function findSameLetterGroup(startRow, startCol, visited) {
    const key = `${startRow}-${startCol}`;
    if (visited.has(key) || !board[startRow][startCol]) {
        return [];
    }
    
    const startLetter = board[startRow][startCol].letter;
    const group = [];
    const queue = [[startRow, startCol]];
    visited.add(key);
    
    while (queue.length > 0) {
        const [row, col] = queue.shift();
        group.push([row, col]);
        
        for (const [nr, nc] of getNeighbors(row, col)) {
            const nkey = `${nr}-${nc}`;
            if (!visited.has(nkey) && board[nr][nc] && board[nr][nc].letter === startLetter) {
                visited.add(nkey);
                queue.push([nr, nc]);
            }
        }
    }
    
    return group;
}

// Find all matches using graph traversal
function findMatches() {
    const matches = new Set();
    const visitedColor = new Set();
    const visitedLetter = new Set();
    
    // Check same color groups with different letters
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (!board[row][col] || visitedColor.has(`${row}-${col}`)) continue;
            
            const group = findSameColorGroup(row, col, visitedColor);
            if (group.length < 3) continue;
            const letters = new Set(group.map(([r, c]) => board[r][c].letter));
            if (letters.size >= 3) {
                group.forEach(pos => matches.add(`${pos[0]}-${pos[1]}`));
                const audioIndex = Math.floor(Math.random() * 8);
                playSound(`exo${audioIndex}`);
            }
        }
    }
    
    // Check same letter groups with different colors
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (!board[row][col] || visitedLetter.has(`${row}-${col}`)) continue;
            
            const group = findSameLetterGroup(row, col, visitedLetter);
            if (group.length < 3) continue;
            const colors = new Set(group.map(([r, c]) => board[r][c].color));
            if (colors.size >= 3) {
                group.forEach(pos => matches.add(`${pos[0]}-${pos[1]}`));
                playSound(board[group[0][0]][group[0][1]].letter);
            }
        }
    }
    
    // Convert to array
    const result = Array.from(matches).map(key => {
        const [r, c] = key.split('-').map(Number);
        return [r, c];
    });
    
    return result;
}

// Remove matched blocks
function removeMatches(matches) {
    matches.forEach(([row, col]) => {
        board[row][col] = null;
    });
}

// Add score based on removed block count and combo
function addScore(removedCount, comboCount) {
    const baseScore = 1;
    score += removedCount * baseScore * comboCount;
    updateScore();
}

// Update combo display
function updateCombo() {
    comboElement.textContent = `콤보: ${combo}`;
}

// Apply gravity (blocks fall down)
function applyGravity() {
    for (let col = 0; col < BOARD_SIZE; col++) {
        let writeIndex = BOARD_SIZE - 1;
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (board[row][col]) {
                board[writeIndex][col] = board[row][col];
                if (writeIndex !== row) board[row][col] = null;
                writeIndex--;
            }
        }
    }
}

// Update score display
function updateScore() {
    scoreElement.textContent = `점수: ${score}`;
}

function playSound(id) {
    const audio = document.getElementById(id);
    audio.currentTime = 0;
    audio.play();
}

// Event listeners
resetBtn.addEventListener('click', initGame);

// Start the game
initGame();
