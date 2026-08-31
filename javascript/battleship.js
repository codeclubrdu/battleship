// Battleship in one file: state lives in a createGame() closure, render(state)
// redraws the whole board from that state, and a single delegated click
// listener feeds guesses in. Read top to bottom.

const BOARD_SIZE = 10;
const MAX_GUESSES = 50; // inherited from the old app's "normal" difficulty

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
 * @property {number} hits sunk when this reaches len
 */

/**
 * @typedef {object} GameState
 * @property {(number | string)[][]} board
 * @property {Ship[]} ships
 * @property {number} guessCount valid shots taken; repeats don't count
 * @property {string} message shown in the info bar
 * @property {boolean} over
 * @property {boolean} won only meaningful once over is true
 */

/**
 * Create a fresh game. All game state lives inside this closure; the returned
 * functions are the only way to read or change it.
 * @returns {{ guess: (row: number, col: number) => void, playAgain: () => void, getState: () => GameState }}
 */
function createGame() {
	let state = freshState();

	/** @returns {GameState} */
	function freshState() {
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
			render(state);
			return;
		}
		state.guessCount++;
		if (cell === EMPTY) {
			state.board[row][col] = MISS;
			state.message = "Miss";
		} else {
			// anything else is a ship-name string
			state.board[row][col] = HIT;
			const ship = state.ships.find((s) => s.name === cell);
			ship.hits++;
			state.message = ship.hits === ship.len ? `You sunk my ${ship.name}!` : "Hit!";
		}
		checkGameOver();
		if (state.over && state.won) launchConfetti();
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
		state = freshState();
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

// Roll random spots until one fits: flip a coin for orientation, pick a random
// origin, then reject and retry if the ship would run off the board or cross
// another ship. Ships are allowed to touch.
function randomPlacement(board, len) {
	while (true) {
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
		if (fits) return positions;
	}
}

/**
 * Redraw everything from state: every board cell, the game-over overlay, then
 * the info bar. No other code touches the DOM (confetti aside), so the page
 * always matches the state exactly.
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
			// Ship-name cells get no class on purpose: unhit ships stay
			// hidden, looking exactly like empty water.
			if (state.board[row][col] === MISS) {
				cell.classList.add("miss");
			} else if (state.board[row][col] === HIT) {
				cell.classList.add("hit");
			}
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

// The overlay sits inside the board container, so its Play Again button is
// picked up by the same delegated click listener as the cells.
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

// Rain 60 confetti pieces from the top of the page; each removes itself once
// the CSS animation is done.
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

// One delegated listener on the board container. Cells are thrown away and
// rebuilt on every render, so per-cell listeners would need rebinding each
// time; the container survives renders. dataset values are strings, so
// convert before guessing.
document.querySelector("#gameboard").addEventListener("click", (event) => {
	if (!(event.target instanceof HTMLElement)) return;
	if (event.target.id === "playAgain") {
		game.playAgain();
		return;
	}
	const { row, col } = event.target.dataset;
	if (row === undefined) return; // overlay or the container's border ring, not a cell
	game.guess(Number(row), Number(col));
});
