// TODO:
// stretch goals:
// play against an actor
   // it needs to give the user a chance to set up their board 
// play against a friend, add a 'player 1/2 ready?' so players can't cheat during board setup

/// Constants
const SIZE = 10;

const SHIPS = [
   { name: "carrier", len: 5, color: "purple"},
   { name: "battleship", len: 4, color: "blue"}, 
   { name: "destroyer", len: 3, color: "orange"},
   { name: "submarine", len: 3, color: "darkblue"}, 
   { name: "patrol", len: 2, color: "pink"}
];

// Single mode: try to sink all the ships in X guesses (difficulty gives fewer guesses)
// CPU mode: play against a CPU
// VS mode: play against another player on the same screen
// maybe add a timer to CPU mode
// maybe make the board bigger/smaller for diff difficulties
const MODE = {single: "single", cpu: "cpu"};
const DIFFICULTY = { easy: 60, normal: 50, hard: 30};

const singleModeSelect = document.getElementById("singleMode");
const vsCpuModeSelect = document.getElementById("vsCpu");
const modeSelectContainer = document.querySelector(".mode-select-container");
const gameBoard = document.getElementById("gameboard");
const infoContainer = document.getElementById("infoContainer");

// this and the other mode select event listener should be refactored
// both are the exact same save the elements they interact with
// this should probably be an app class
singleModeSelect.addEventListener("click", (e) => {
   modeSelectContainer.classList.add("hide");

   const singleModeFormController = new AbortController();
   const singleModeForm = document.getElementById("singleModeForm");
   singleModeForm.classList.remove("hide");
   singleModeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target));
      singleModeForm.classList.add("hide"); 
      document.getElementById("backBtn").classList.add("hide");
      new Game(formData.difficulty);
   }, { signal: singleModeFormController.signal });
   
   const backBtnController = new AbortController();
   const backBtn = document.getElementById("backBtn");
   backBtn.classList.remove("hide");
   backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      singleModeForm.classList.add("hide");
      singleModeFormController.abort();
      gameBoard.innerHTML = "";
      goBackToMainMenu();
      backBtn.classList.add("hide");
      backBtnController.abort();
   }, { signal: backBtnController.signal });
})

vsCpuModeSelect.addEventListener("click", (e) => {
   e.preventDefault();
   console.log('vs mode clicked');
   modeSelectContainer.classList.add("hide");

   const vsCpuModeFormController = new AbortController();
   const vsCpuModeForm = document.getElementById("vsCpuModeForm");
   vsCpuModeForm.classList.remove("hide");
   vsCpuModeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target));
      vsCpuModeForm.classList.add("hide"); 
      document.getElementById("backBtn").classList.add("hide");
      new Game(formData.difficulty);
   }, { signal: vsCpuModeFormController.signal });
   
   const backBtnController = new AbortController();
   const backBtn = document.getElementById("backBtn");
   backBtn.classList.remove("hide");
   backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      vsCpuModeForm.classList.add("hide");
      vsCpuModeFormController.abort();
      gameBoard.innerHTML = "";
      goBackToMainMenu();
      backBtn.classList.add("hide");
      backBtnController.abort();
   }, { signal: backBtnController.signal });

})

const goBackToMainMenu = () => {
   gameBoard.innerHTML = "";
   modeSelectContainer.classList.remove("hide");
   const infoElements = infoContainer.querySelectorAll("div");
   infoElements.forEach((e) => e.innerHTML = "");
}

class Game {
   turn;
   actor;
   player;
   guessCount;
   boardElement;
   board;
   win;
   gameOver;
   gameOverMessageEl;
   gameInfoEl;
   guessCountEl;
   MAX_GUESSES;

   constructor(difficulty) {
      this.gameOver = false;
      this.guessCount = 0;
      this.MAX_GUESSES = DIFFICULTY[difficulty];
      this.boardElement = gameBoard;
      this.gameInfoEl = document.getElementById("gameInfo");
      this.guessCountEl = document.getElementById("guessCount");

      this.board = new Board(this.boardElement, this);
      this.gameInfoEl.innerText = "Select a square to begin"
   }

   incrementGuess() {
      this.guessCount++;
      this.checkGameOver();
   }

   checkGameOver() {
      if(this.guessCount >= this.MAX_GUESSES) {
         this.endGame({ win: false, notifyBoard: true });
      }
   }

   endGame({ win, notifyBoard = false }) {
      if (this.gameOver) return;
      if (win) this.launchConfetti();
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
      backToMainMenuBtn.addEventListener("click", goBackToMainMenu);
      gameOverContainer.appendChild(backToMainMenuBtn);

      if (notifyBoard) {
         this.board.end();
      }
      this.gameOver = true;
   }

   playAgain() {
      this.guessCount = 0;
      this.boardElement.innerHTML = "";
      this.gameInfoEl.innerText = "Select a square to begin"
      this.guessCountEl.innerText = "";
      this.board = new Board(this.boardElement, this);
   }

   launchConfetti() {
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

   render({ message }) {
      this.guessCountEl.innerText = "Guesses remaining: " + (this.MAX_GUESSES - this.guessCount) + "  | ";
      this.gameInfoEl.innerText = message;
   }
}

class Actor {
   difficulty;
   constructor(difficulty) {
      this.difficulty = difficulty;
      new Board(document.getElementById("gameboard"));
   }

   guess() {
      
   }
}

// extend game with cpuGame

// extend game with singleGame

// move all checkWin logic up into game from board. board should only track it's own state

// step one, user selects the game mode they want to play
// user sets board from legend
// user confirms ready to play
// user created board transforms and user is prompted to go first
// user selects a guess and sees result
// actor makes guess and user sees result on board
// during actor turn user cannot select anything on board
// game ends when either player or actor has sunk all ships
//    opposing board
// user can select play again and is taken back to 
// user can select change difficulty which takes them
//    back to user create board
class Player {
   constructor() {

   }
}

// TODO: may need to rethink how boards are rendered on the screen because
// once we have a cpu, we won't want to render it's board, just log the guesses
class Board {
   cols = SIZE;
   rows = SIZE;
   ships = [];
   boardPieces = [];
   shipsSunk;
   boardState;
   game;
   boundCheckHit;

   constructor(board, game) {
      this.game = game;
      this.shipsSunk = 0;
      this.boundCheckHit = this.checkHit.bind(this);
      this.boardState = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      SHIPS.forEach((shipBase) => {
         const ship = new Ship(this.boardState, shipBase);
         this.ships.push(ship);
         ship.getPos().forEach((pos) => {
            this.boardState[pos.x][pos.y] = shipBase.name;
         })
      })
      this.board = board;
      this.render();
   }

   checkCornerPiece(position) {
      if (position.x === 0 && position.y === 0) {
         return { value: true, location: "top-left"}
      } else if (position.x === 0 && position.y === SIZE - 1) {
         return { value: true, location: "top-right"}
      } else if (position.x === SIZE - 1  && position.y === 0) {
         return { value: true, location: "bottom-left"}
      } else if (position.x === SIZE - 1  && position.y === SIZE - 1) {
         return { value: true, location: "bottom-right"}
      } else {
         return { value: false, location: ""};
      }         
   }

   checkEdgePiece(position) {
      if (position.x === 0 ) {
         return { value: true, location: "top"}
      } else if (position.y === SIZE - 1 ) {
         return { value: true, location: "right"}
      } else if (position.y === 0 ) {
         return { value: true, location: "left"}
      } else if (position.x === SIZE - 1) {
         return { value: true, location: "bottom"}
      } else {
         return { value: false, location: ""};
      }     
   }

   createPiece(parent, value, position) {
      const divEl = document.createElement("div");
      divEl.dataset.position = JSON.stringify(position);
      const isCornerPiece = this.checkCornerPiece(position);
      const isEdgePiece = this.checkEdgePiece(position);
      if (isCornerPiece.value) {
         divEl.classList.add(`${isCornerPiece.location}-corner`);
      } else if (isEdgePiece.value) {
         divEl.classList.add(`${isEdgePiece.location}-edge`);
      }
      if (typeof value === "string") {
         divEl.classList.add(value);
      }
      if (value === 2) {
         divEl.classList.add("hit");
      }
      if (value === 1) {
         divEl.classList.add("miss");
      }
      divEl.addEventListener("click", this.boundCheckHit);
      parent.appendChild(divEl);
      return divEl;
   }

   render() {
      this.boardState.map((row, indexX) => {
         row.map((value, indexY) => {
            const piece = this.createPiece(this.board, value, new Vec(indexX, indexY));
            this.boardPieces.push(piece);
         })
      })
   }

   checkHit(element) {
      const position = JSON.parse(element.target.dataset.position);
      const value = this.boardState[position.x][position.y];
      if (value === 0) {
         this.game.incrementGuess();
         this.game.render({ message: "Miss" })
         element.srcElement.classList.add("miss");
         this.updateBoardState(1, position);
         return;
      }
      if (value === 1 || value === 2) {
         this.game.render({ message: "You already shot there."});
         return;
      }
      if (typeof value === 'string') {
         this.game.render({ message: "Hit!"});
         this.game.incrementGuess();
         element.srcElement.classList.add("hit");
         const shipName = this.boardState[position.x][position.y]
         const shipHit = this.ships.find((ship) => ship.class === shipName);
         shipHit.incrementHit();
         const isSunk = shipHit.checkSunk();
         if (isSunk) {
            this.shipSank(shipHit.class)
         }
         this.updateBoardState(2, position);
         return;
      }
   }

   shipSank(shipName) {
      this.game.render({ message: `You just sunk my ${shipName}!`})
      this.shipsSunk++;
      this.checkWin();
   }

   checkWin() {
      if(this.shipsSunk === SHIPS.length) {
         this.game.endGame({ win: true });
         this.end();
      }
   }

   end() {
      this.boardPieces.forEach((piece) => {
         piece.removeEventListener("click", this.boundCheckHit);
      })               
   }

   updateBoardState(result, position) {
      this.boardState[position.x][position.y] = result;
   }
}

class Ship {
   vertical;
   shipLength;
   class;
   hits;
   positions = [];
  
   constructor(boardState, ship) {
      this.hits = 0;
      this.vertical = Math.random() < 0.5;
      this.shipLength = ship.len;
      this.class = ship.name;
      this.positions.push(this.createSeed(boardState));
      for (let i = 0; i < ship.len - 1; i++) {
         if(this.vertical) {
               this.positions.push(new Vec(this.positions[i].x + 1, this.positions[0].y));
         } else {
            this.positions.push(new Vec(this.positions[i].x, this.positions[i].y + 1));
         }
      }
   }

   createSeed(boardState) {
      let isSeedInvalid = true;
      let seedX;
      let seedY;

      while(isSeedInvalid) {
         // calling random here is expensive, we should probably just do it once
         seedX = Math.floor(Math.random() * SIZE);
         seedY = Math.floor(Math.random() * SIZE);
         isSeedInvalid = !this.validateSeed({ seedX, seedY, boardState, shipLength: this.shipLength, vertical: this.vertical });
      }
      return new Vec(seedX, seedY);
   }

   validateSeed({ seedX, seedY, boardState, shipLength, vertical }) {
      let isValid = false;
      // check that the ship is in bounds, if not return early
      if (vertical) {
         if (seedX + shipLength > SIZE){
            return isValid; 
         }
      } else {
         if (seedY + shipLength > SIZE) {
            return isValid;            
         }
      }
      // check if spot is taken by another ship
      for (let i = 0; i < shipLength; i++) {
         if (vertical) {
            if (boardState[seedX + i][seedY] === 0) {
               isValid = true;
            } else {
               isValid = false;
               return isValid;
            }
         } else {
            if (boardState[seedX][seedY + i] === 0) {
               isValid = true;
            } else {
               isValid = false;
               return isValid;
            }
         }
      }
      return isValid;
   }

   incrementHit() {
      this.hits++;
   }

   checkSunk() {
      let sunk = false;
      if (this.hits === this.shipLength) {
         sunk = true;
      }
      return sunk;
   }

   getPos() {
      return this.positions;
   }
}

class Vec {
   x;
   y;
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
}







