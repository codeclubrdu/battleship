// Battleship: state lives in a createGame() closure, render(state)
const BOARD_SIZE = 10;
const MAX_GUESSES = 50;

// Each cell is a single slot: 0 = empty, 1 = miss, 2 = hit, or a ship-name
// string ("carrier", ...) for an unhit ship cell. If one slot with several
// meanings is hard to hold, picture each cell as { ship, guessed } instead —
// the single slot is the same information flattened.
const EMPTY = 0;
const MISS = 1;
const HIT = 2;

// The five standard Battleship ships.
const FLEET = [
	{ name: "carrier", len: 5 },
	{ name: "battleship", len: 4 },
	{ name: "destroyer", len: 3 },
	{ name: "submarine", len: 3 },
	{ name: "patrol", len: 2 },
];

/**
 * @typedef {object} Ship
 * @property {string} name matches the board's ship-name cells
 * @property {number} len
 * @property {{ row: number, col: number }[]} positions
 * @property {number} hits 
 */

/**
 * @typedef {object} GameState
 * @property {(number | string)[][]} board
 * @property {Ship[]} ships
 * @property {number} guessCount valid shots taken 
 * @property {string} message shown in the info bar
 * @property {boolean} over
 * @property {boolean} won 
 */

/**
 * Create a fresh game. All game state lives inside this closure
 * @returns {{ guess: (row: number, col: number) => void, playAgain: () => void, getState: () => GameState }}
 */
function createGame() {
	let state = init();

	/** @returns {GameState} */
	function init() {
		const board = createBoard();
		return {
			board,
			ships: placeShips(board),
			guessCount: 0,
			message: "Select a square to begin",
			over: false,
			won: false,
		};
	}

	/**
	 * Fire a shot at { row, col }: hit a ship, mark a miss, or reject a repeat.
	 * Counts the shot, sinks ships, and ends the game when won or out of guesses.
	 * @param {number} row
	 * @param {number} col
	 */
	function guess(row, col) {
		if (state.over) return;
		const cell = state.board[row][col];
		if (cell === MISS || cell === HIT) {
			state.message = "You already shot there.";
		} else {
			state.guessCount++;
			if (cell === EMPTY) {
				state.board[row][col] = MISS;
				state.message = "Miss";
			} else {
				state.board[row][col] = HIT;
				const ship = state.ships.find((s) => s.name === cell);
				ship.hits++;
				state.message = ship.hits === ship.len ? `You sunk my ${ship.name}!` : "Hit!";
			}
			checkGameOver();
			if (state.over && state.won) launchConfetti();
		}
		render(state);
	}

	// Win beats the guess cap: sinking the last ship on the last guess is a win.
	function checkGameOver() {
		if (state.ships.every((ship) => ship.hits === ship.len)) {
			state.over = true;
			state.won = true;
		} else if (state.guessCount >= MAX_GUESSES) {
			state.over = true;
			state.won = false;
		}
	}

	// Start over: new board, new random fleet, counters back to zero.
	function playAgain() {
		state = init();
		render(state);
	}

	return { guess, playAgain, getState: () => state };
}

// Build a BOARD_SIZE x BOARD_SIZE grid of empty cells.
function createBoard() {
	const board = [];
	for (let row = 0; row < BOARD_SIZE; row++) {
		board.push(new Array(BOARD_SIZE).fill(EMPTY));
	}
	return board;
}

/**
 * Place the whole fleet at random, writing each ship's name into the board
 * cells it occupies, and return the ships for the state.
 * @param {(number | string)[][]} board
 * @returns {Ship[]}
 */
function placeShips(board) {
	const ships = [];
	for (const { name, len } of FLEET) {
		const positions = randomPlacement(board, len);
		for (const { row, col } of positions) {
			board[row][col] = name;
		}
		ships.push({ name, len, positions, hits: 0 });
	}
	return ships;
}

// Roll a random spot: flip a coin for orientation, pick a random origin, and
// keep the ship if it stays on the board and crosses nothing — otherwise roll
// again recursively. Each retry adds a stack frame (JS doesn't optimize tail
// calls), so this is only safe while retries stay rare — on this 10x10 board
// most rolls fit. 
function randomPlacement(board, len) {
	const across = Math.random() < 0.5;
	const originRow = Math.floor(Math.random() * BOARD_SIZE);
	const originCol = Math.floor(Math.random() * BOARD_SIZE);
	const positions = [];
	for (let i = 0; i < len; i++) {
		positions.push({
			row: across ? originRow : originRow + i,
			col: across ? originCol + i : originCol,
		});
	}
	const fits = positions.every(
		({ row, col }) => row < BOARD_SIZE && col < BOARD_SIZE && board[row][col] === EMPTY,
	);
	return fits ? positions : randomPlacement(board, len);
}

/**
 * Redraw everything from state: every board cell, the game-over overlay, then
 * the info bar. 
 * @param {GameState} state
 */
function render(state) {
	const boardEl = document.querySelector("#gameboard");
	boardEl.innerHTML = "";
	for (let row = 0; row < BOARD_SIZE; row++) {
		for (let col = 0; col < BOARD_SIZE; col++) {
			const cell = document.createElement("div");
			cell.dataset.row = String(row);
			cell.dataset.col = String(col);
			const cls = cellClass(state, row, col);
			if (cls) cell.classList.add(cls);
			boardEl.appendChild(cell);
		}
	}
	if (state.over) {
		boardEl.appendChild(gameOverOverlay(state.won));
	}
	document.querySelector("#guessCount").textContent =
		`Guesses remaining: ${MAX_GUESSES - state.guessCount} |`;
	document.querySelector("#gameInfo").textContent = state.message;
}

/**
 * Which CSS class a cell gets, if any. Unhit ship cells get no class on
 * purpose — hidden ships look exactly like empty water — except at reveal
 * time: a sunk ship's cells show its own color instead of hit-red, and losing
 * exposes every remaining ship.
 * @param {GameState} state
 * @param {number} row
 * @param {number} col
 * @returns {string | null}
 */
function cellClass(state, row, col) {
	const value = state.board[row][col];
	let cls = null;
	if (value === MISS) {
		cls = "miss";
	} else if (value === HIT) {
		const ship = shipAt(state.ships, row, col);
		cls = ship.hits === ship.len ? ship.name : "hit";
	} else if (typeof value === "string" && state.over && !state.won) {
		cls = value; 
	}
	return cls;
}

function shipAt(ships, row, col) {
	return ships.find((ship) =>
		ship.positions.some((p) => p.row === row && p.col === col),
	);
}

function gameOverOverlay(won) {
	const overlay = document.createElement("div");
	overlay.id = "gameOver";
	const message = document.createElement("p");
	message.textContent = won ? "You won!" : "You lost.";
	overlay.appendChild(message);
	const button = document.createElement("button");
	button.id = "playAgain";
	button.textContent = "Play again";
	overlay.appendChild(button);
	return overlay;
}

function launchConfetti() {
	const colors = ["purple", "blue", "orange", "pink", "red", "gold"];
	for (let i = 0; i < 60; i++) {
		const piece = document.createElement("div");
		piece.classList.add("confetti");
		piece.style.left = Math.random() * 100 + "vw";
		piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
		piece.style.animationDelay = Math.random() * 1.5 + "s";
		document.body.appendChild(piece);
		setTimeout(() => piece.remove(), 4500);
	}
}

const game = createGame();
render(game.getState());

// One delegated listener on the board container. Container survives renders. 
// Dataset values are strings, so convert before guessing.
document.querySelector("#gameboard").addEventListener("click", (event) => {
	if (!(event.target instanceof HTMLElement)) return;
	if (event.target.id === "playAgain") {
		game.playAgain();
		return;
	}
	const { row, col } = event.target.dataset;
	if (row === undefined) return; 
	game.guess(Number(row), Number(col));
});
