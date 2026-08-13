import Board from "./board.js";

/**
 * Base game: owns the board, the info bar, and the end-of-game flow.
 * Subclasses decide the win/loss rules and per-turn behavior.
 */
class Game {

   /** @type {import("./ship.js").ShipDef[]} */
   static SHIPS = [
      { name: "carrier", len: 5, color: "purple"},
      { name: "battleship", len: 4, color: "blue"},
      { name: "destroyer", len: 3, color: "orange"},
      { name: "submarine", len: 3, color: "darkblue"},
      { name: "patrol", len: 2, color: "pink"}
   ];
   static SIZE = 10;

   app;
   board;
   difficulty;
   shipsSunk = 0;
   boardElement;
   gameInfoEl;
   gameOver;

   /**
    * @param {object} params
    * @param {import("./app.js").App} params.app - Owning app, used to return to the menu.
    * @param {string} params.difficulty - Difficulty key chosen on the start form.
    * @param {Element} params.gameBoard - DOM container the board renders into.
    */
   constructor({ app, difficulty, gameBoard }) {
      this.app = app;
      this.difficulty = difficulty;
      this.boardElement = gameBoard;
      this.gameInfoEl = document.getElementById("gameInfo");
      this.gameOver = false;
   }

   /**
    * Empty hook for when guesses are made on the board
    * @returns {void}
    */
   onGuess() {}

   /**
    * Updates the info bar with feedback for the player.
    * @param {object} params
    * @param {string} params.message - Text to show.
    */
   render({ message }) {
      this.gameInfoEl.innerText = message;
   }

   /**
    * Called by the board when a ship's last cell is hit.
    * @param {string} shipName - Name of the sunk ship.
    */
   shipSank(shipName) {
      this.render({ message: `You just sunk my ${shipName}!`})
      this.shipsSunk++;
      this.checkWin();
   }

   /**
    * Ends the game with a win once every ship is sunk.
    */
   checkWin() {
      if(this.shipsSunk === Game.SHIPS.length) {
         this.endGame({ win: true });
         this.board.deactivateBoard();
      }
   }

   /**
    * Shows the game-over UI (message, replay, back-to-menu). No-op if already over.
    * @param {object} params
    * @param {boolean} params.win - True for a win, false for a loss.
    * @param {boolean} [params.notifyBoard] - Also disable further clicks on the board.
    */
   endGame({ win, notifyBoard = false }) {
      if (this.gameOver) return;
      if (win) this.#launchConfetti();
      // show game over message
      const gameOverContainer = document.createElement("div");
      gameOverContainer.id = "gameOver";
      this.boardElement.appendChild(gameOverContainer);

      const gameOverMessage = document.createElement("p");
      gameOverMessage.innerText = win ? "You won!" : "You lost.";
      gameOverContainer.appendChild(gameOverMessage);
      this.gameOverMessageEl = gameOverMessage;

      const replay = document.createElement("button");
      replay.innerText = "Play again";
      replay.classList.add("play-again-btn");
      replay.addEventListener("click", this.playAgain.bind(this));
      gameOverContainer.appendChild(replay);

      const backToMainMenuBtn = document.createElement("button");
      backToMainMenuBtn.innerText = "Back to menu";
      backToMainMenuBtn.classList.add("play-again-btn");
      backToMainMenuBtn.addEventListener("click", this.app.goBackToMainMenu);
      gameOverContainer.appendChild(backToMainMenuBtn);

      if (notifyBoard) {
         this.board.deactivateBoard();
      }
      this.gameOver = true;
   }

   /**
    * Resets game state and builds a fresh board in the same container.
    */
   playAgain() {
      this.boardElement.innerHTML = "";
      // this.gameInfoEl.innerText = message;
      this.shipsSunk = 0;
      this.gameOver = false;
      this.board = new Board({ boardContainer: this.boardElement, game: this, ships: Game.SHIPS, size: Game.SIZE });
   }

   #launchConfetti() {
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
}

/**
 * Versus-CPU mode (work in progress): player places ships, then trades turns with a CPU.
 */
class CpuGame extends Game {

   /**
    * @param {object} params
    * @param {import("./app.js").App} params.app
    * @param {string} params.difficulty
    * @param {Element} params.gameBoard
    */
   constructor({ app, difficulty, gameBoard }) {
      super({ app, difficulty, gameBoard });
      this.showPlaceShips();
   }

   //
   // user placeShips
      // show legend with draggable ships
      // show instructions for user to drag ships
      // user drags ships
      // user can select rotate button on legend to change boat orientation
      // board checks for conflicts
      // user can clear board to restart
      // confirm button enables once all 5 peices are dragged onto board
      // user confirms

   /**
    * Prompts the player to start placing their ships.
    */
   showPlaceShips() {
      this.render({ message: "Drag a ship onto the board, use rotate to change orientation" });
      // this.gameBoard
   }

   // beginGame
      // cpu and random board is created
      //

   // endTurn

   #showLegend() {

   }

}

/**
 * Solo mode: sink every ship within a difficulty-based guess limit.
 */
class SingleGame extends Game {
   /** Guess limits per difficulty key. */
   static DIFFICULTY = { easy: 60, normal: 50, hard: 30};
   guessCount = 0;
   guessCountEl;
   maxGuesses;


   /**
    * @param {object} params
    * @param {import("./app.js").App} params.app
    * @param {string} params.difficulty - Key into SingleGame.DIFFICULTY.
    * @param {Element} params.gameBoard
    */
   constructor({ app, difficulty, gameBoard }) {
      super({ app, difficulty, gameBoard });
      this.MAX_GUESSES = SingleGame.DIFFICULTY[difficulty];
      this.guessCountEl = document.getElementById("guessCount");
      this.gameInfoEl.innerText = "Select a square to begin"
      this.board = new Board({ boardContainer: this.boardElement, game: this, ships: Game.SHIPS, size: Game.SIZE });
   }

   /**
    * Counts a guess and ends the game if the limit is reached.
    */
   onGuess() {
      this.guessCount++;
      this.#checkGameOver();
   }

   /**
    * Updates the info bar and the remaining-guess counter.
    * @param {object} params
    * @param {string} params.message - Text to show.
    */
   render({ message }) {
      this.guessCountEl.innerText = "Guesses remaining: " + (this.MAX_GUESSES - this.guessCount) + "  | ";
      this.gameInfoEl.innerText = message;
   }

   /**
    * Resets guesses and game state, then builds a fresh board.
    */
   playAgain() {
      this.boardElement.innerHTML = "";
      this.gameInfoEl.innerText = "Select a square to begin"
      this.guessCountEl.innerText = "";
      this.guessCount = 0;
      this.shipsSunk = 0;
      this.gameOver = false;
      this.board = new Board({ boardContainer: this.boardElement, game: this, ships: Game.SHIPS, size: Game.SIZE });
   }

   #checkGameOver() {
      if(this.guessCount >= this.MAX_GUESSES) {
         this.endGame({ win: false, notifyBoard: true });
      }
   }

}

export { Game, SingleGame, CpuGame };
