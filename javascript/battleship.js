// Then check if user sunk ship
// Then check if user won
// Then create restart and start game 

/// Constants
const SIZE = 10;

const SHIPS = [
   { name: "carrier", len: 5, color: "purple"},
   { name: "battleship", len: 4, color: "blue"}, 
   { name: "destroyer", len: 3, color: "orange"},
   { name:  "submarine", len: 3, color: "darkblue"}, 
   { name: "patrol", len: 2, color: "pink"}
];

// Game logic
class Game {

   constructor() {
      new Board(document.getElementById("gameboard"));
   }
}

class Board {
   cols = SIZE;
   rows = SIZE;
   boardState;

   constructor(board) {
      this.boardState = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      SHIPS.forEach((shipBase) => {
         const ship = new Ship(this.boardState, shipBase);
         ship.getPos().forEach((pos) => {
            this.boardState[pos.x][pos.y] = shipBase.name;
         })
      })
      this.board = board;
      this.render();
   }

   createPiece(parent, value, position) {
      const div = document.createElement("div");
      div.dataset.position = JSON.stringify(position);
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
         case 1:
            div.classList.add("hit");
            break;
         case 2:
            div.classList.add("miss");
            break;
      }
      div.addEventListener("click", this.checkHit.bind(this))
      parent.appendChild(div); 
   }

   // TODO: Add a way to render inside/edge blocks differently 
   // so that border isn't doubled inside grid
   render() {
      this.boardState.map((row, indexX) => {
         row.map((value, indexY) => {
            this.createPiece(this.board, value, new Vec(indexX, indexY));
         })
      })
   }

   // No change is kind of pointless but I'm afraid 
   // if I take it out I'll realize I need it. So I'm leaving
   // the clutter idc
   checkHit(element) {
      const position = JSON.parse(element.srcElement.dataset.position);
      const value = this.boardState[position.x][position.y];
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
            this.checkSunk(position)
            this.updateBoardState(RESULTS.hit.value, position);
            break;
      }
   }

   checkSunk(position) {
      // look at nearby elements, check to see which direction the ship goes
      // then once determined we can look to see the other values are all 
      const shipHit = this.boardState[position.x][position.y]
      console.log("ship that was hit: ", shipHit);
      // announce that battleship has been sunk if no other values show the string value
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
   positions = [];
  
   constructor(boardState, ship) {
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
*/



