// TODO: create restart
// add messages -> hit, miss, you already shot there
// add message won/lost message instead of game over
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
const MODE = {single: "single", cpu: "cpu", vs: "vs"};
const DIFFICULTY = { easy: 60, normal: 50, hard: 30};

const startForm = document.getElementById("startForm")
startForm.addEventListener("submit", (e) => {
   e.preventDefault();
   const formData = Object.fromEntries(new FormData(e.target));
   console.log("formData: ", formData);
   startForm.classList.add("hide"); 
   new Game(formData.difficulty);
})

class Game {
   turn;
   actor;
   player;
   guessCount;
   boardElement;
   board;
   win;
   MAX_GUESSES;

   constructor(difficulty) {
      this.guessCount = 0;
      this.MAX_GUESSES = DIFFICULTY[difficulty];
      this.boardElement = document.getElementById("gameboard");
      this.board = new Board(this.boardElement, this);
   }
   
   incrementGuess() {
      this.guessCount++;
      this.checkGameOver();
   }

   checkGameOver() {
      if(this.guessCount >= this.MAX_GUESSES) {
         // show game over message 
         const gameOverMessage = document.createElement("p");
         gameOverMessage.innerText = "Game over";
         gameOverMessage.id = "gameOver"
         this.boardElement.appendChild(gameOverMessage);
         this.board.end();

      }
   }

   render() {
      // this is where all updates to non-board related state will go.
      // last attempt message, ships sunk, game win, game loss
      // quit, play again
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
      if (position.x === 0 && position.y === 0 ) {
         return { value: true, location: "top-left"}
      } else if (position.x === 0 && position.y === SIZE - 1 ) {
         return { value: true, location: "top-right"}
      } else if (position.x === SIZE - 1  && position.y === 0 ) {
         return { value: true, location: "bottom-left"}
      } else if (position.x === SIZE - 1  && position.y === SIZE - 1 ) {
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
      switch (value) {
         case "carrier":
            divEl.classList.add("carrier");
            break;
         case "battleship":
            divEl.classList.add("battleship");
            break;
         case "destroyer":
            divEl.classList.add("destroyer");
            break;
         case "submarine":
            divEl.classList.add("submarine");
            break;
         case "patrol":
            divEl.classList.add("patrol");
            break;
         case 1:
            divEl.classList.add("hit");
            break;
         case 2:
            divEl.classList.add("miss");
            break;
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

   // No change is kind of pointless but I'm afraid 
   // if I take it out I'll realize I need it. So I'm leaving
   // the clutter idc
   checkHit(element) {
      this.game.addGuess();
      const position = JSON.parse(element.srcElement.dataset.position);
      const value = this.boardState[position.x][position.y];
      // refactor this, it's clunky and could be done better
      const RESULTS = {
         miss: { css: "miss", value: 0 }, 
         noChange: { css: "no-change", value: 1 },
         hit: { css: "hit", value: 2 }
      };
      switch (value) {
         case 0: 
            console.log(RESULTS.miss);
            element.srcElement.classList.add(RESULTS.miss.css);
            this.updateBoardState(RESULTS.miss.value, position);
            break;
         case 1:
         case 2:
            console.log("already shot there!");
            break;
         case "carrier":
         case "battleship":
         case "destroyer":
         case "submarine":
         case "patrol":
            console.log(RESULTS.hit.css);
            element.srcElement.classList.add(RESULTS.hit.css);
            const shipName = this.boardState[position.x][position.y]
            const shipHit = this.ships.find((ship) => ship.class === shipName);
            shipHit.addHit();
            const isSunk = shipHit.checkSunk();
            if (isSunk) {
               this.shipSank(isSunk, shipHit.class)
            }
            this.updateBoardState(RESULTS.hit.value, position);
            break;
      }
   }

   shipSank(isSunk, shipName) {
      console.log("you just sunk my", shipName);
      this.shipsSunk++;
      this.checkWin();
   }

   checkWin() {
      if(this.shipsSunk === SHIPS.length) {
         console.log("you won!");
         this.end();
         // add element that says you won absolute positioned on top of the winning board
         // it should also have a button below that asks "play again"
      }
   }

   end() {
      console.log("board pieces: ", this.boardPieces);
      this.boardPieces.forEach((piece) => {
         piece.removeEventListener("click", this.boundCheckHit);
      })               
      console.log('game end, removing event listeners')
   }

   // this doesn't do much now but if we ever wanted to do more
   // robust state managment it's easier to start from here
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
         isSeedInvalid = !this.validateSeed(seedX, seedY, boardState, this.shipLength, this.vertical);
      }
      return new Vec(seedX, seedY);
   }

   validateSeed(seedX, seedY, boardState, shipLength, vertical) {
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

   addHit() {
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
   get x() {
      return this.x; 
   }
   get y() {
      return this.y;
   }
}







