/// Constants
const SIZE = 10;

const SHIPS = [
   { name: "carrier", len: 5, color: "purple"},
   { name: "battleship", len: 4, color: "blue"}, 
   { name: "destroyer", len: 3, color: "orange"},
   { name:  "submarine", len: 3, color: "darkblue"}, 
   { name: "patrol", len: 2, color: "pink"}
];

// Helper functions
const getElById = (el) => {
   return document.getElementById(el);
}

const createEl = (parent, value) => {
   const div = document.createElement("div");
   switch (value) {
      case "carrier":
         div.classList.add("carrier");
         break;
      case "battleship":
         div.classList.add("battleship");
         break;
      case "destroyer":
         div.classList.add("destroyer");
         break;
      case "submarine":
         div.classList.add("submarine");
         break;
      case "patrol":
         div.classList.add("patrol");
         break;
   }
   parent.appendChild(div); 
}

const validateSeed = (seedX, seedY, boardState, shipLength, vertical) => {
   console.log("validating seed: ", seedX, " ", seedY)
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
   for (let i = 0; i < shipLength - 1; i++) {
      if (vertical) {
         if (boardState[seedX + i][seedY] === 0) {
            isValid = true;
         } else {
            isValid = false;
            return isValid;
          }
      } else {
         if (boardState[seedX][seedY + 1] === 0) {
            isValid = true;
         } else {
            isValid = false;
            return isValid;
         }
      }
   }
   return isValid;
}

// Game logic
class Game {

   constructor() {
      new Board(getElById("gameboard"));
   }

   clear() {

   }
}

class Board {
   cols = SIZE;
   rows = SIZE;
   boardState;
   constructor(board) {
      this.boardState = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      SHIPS.map((shipBase) => {
         const ship = new Ship(this.boardState, shipBase);
         ship.getPos().forEach((pos) => {
            this.boardState[pos.x][pos.y] = shipBase.name;
         })
      })
      this.board = board;
      this.render();
   }

   render() {
      console.log("board: ", this.boardState);
      this.boardState.map((row) => {
         row.map((value) => {
            createEl(this.board, value);
         })
      })

   }

   checkHit() {

   }
}

class Ship {
   vertical = true;
   shipLength;
   class;
   positions = [];
   constructor(boardState, ship) {
      this.shipLength = ship.len;
      this.class = ship.class;
      // come up with way to generate random number betwen 1-10 that doesn't conflict 
      // with existing things in board
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
         isSeedInvalid = !validateSeed(seedX, seedY, boardState, this.shipLength, this.vertical);
      }
      return new Vec(seedX, seedY);
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

new Game();

// it needs to track state
   // state like if the user has hit (and where)
   // state like if the user has missed (and where)


// stretch goals
// play against an actor
// state management 
   // it needs to track whose turn is it
   // it needs to give the user a chance to set up their board 

/* lazy way of tracking when the game is won: just increment hitCount on every hit
   in this version, and according to the official Hasbro rules (http://www.hasbro.com/common/instruct/BattleShip_(2002).PDF)
   there are 17 hits to be made in order to win the game:
      Carrier     - 5 hits
      Battleship  - 4 hits
      Destroyer   - 3 hits
      Submarine   - 3 hits
      Patrol.     - 2 hits
*/

/* create the 2d array that will contain the status of each square on the board
   and place ships on the board (later, create function for random placement!)

   0 = empty, 1 = part of a ship, 2 = a sunken part of a ship, 3 = a missed shot
*/

