// Battleship in one file: state lives in a createGame() closure, render(state)
// redraws the whole board from that state, and a single delegated click
// listener feeds guesses in. Read top to bottom.

const BOARD_SIZE = 10;

// Each cell is a single slot: 0 = empty, 1 = miss. Chunk 1b adds 2 = hit and
// ship-name strings ("carrier", ...). If one slot with several meanings is
// hard to hold, picture each cell as { ship, guessed } instead — the single
// slot is the same information flattened.
const EMPTY = 0;
const MISS = 1;

/**
 * @typedef {object} GameState
 * @property {(number | string)[][]} board
 * @property {string} message shown in the info bar
 * @property {boolean} over
 */

/**
 * Create a fresh game. All game state lives inside this closure; the returned
 * functions are the only way to read or change it.
 * @returns {{ guess: (row: number, col: number) => void, getState: () => GameState }}
 */
function createGame() {
	const state = {
		board: createBoard(),
		message: "Select a square to begin",
		over: false,
	};

	/**
	 * Fire a shot at { row, col }: mark a miss, or reject a repeat guess.
	 * @param {number} row
	 * @param {number} col
	 */
	function guess(row, col) {
		if (state.over) return;
		const cell = state.board[row][col];
		if (cell === MISS) {
			state.message = "You already shot there.";
		} else {
			state.board[row][col] = MISS;
			state.message = "";
		}
		render(state);
	}

	return { guess, getState: () => state };
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
 * Redraw everything from state: every board cell, then the info bar. No other
 * code touches the DOM, so the page always matches the state exactly.
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
			if (state.board[row][col] === MISS) {
				cell.classList.add("miss");
			}
			boardEl.appendChild(cell);
		}
	}
	document.querySelector("#gameInfo").textContent = state.message;
}

const game = createGame();
render(game.getState());

// One delegated listener on the board container. Cells are thrown away and
// rebuilt on every render, so per-cell listeners would need rebinding each
// time; the container survives renders. dataset values are strings, so
// convert before guessing.
document.querySelector("#gameboard").addEventListener("click", (event) => {
	if (!(event.target instanceof HTMLElement)) return;
	const { row, col } = event.target.dataset;
	if (row === undefined) return; // the container's own border ring, not a cell
	game.guess(Number(row), Number(col));
});
