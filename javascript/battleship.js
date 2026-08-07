// Helper function
const getElById = (el) => {
   return document.getElementById(el);
}

// we need to instantiate a battleship game
class Game {

   constructor() {
      this.gameBoard = getElById("gameboard");
      this.newGame();
   }

   newGame() {
      new Board();
   }

   clear() {

   }
}

// it needs a board
class Board {
   boardHeight = 10;
   boardWidth = 10;
   board = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
   ]
   constructor() {
      const ship = new Ship();
      ship.getPos().forEach((pos) => {
         this.board[pos.x][pos.y] = 1;
      })
      console.log("board: ", this.board);
   }

   createBoard() {
      // how do we place the ships we need in the correct places?
         // we have 5 ships
         // they must not conflict
         // it must be random
   }

   checkHit() {

   }
}

class Ship {
   vertical = true;
   shipLength = 5;
   class = "carrier";
   positions = [new Vec(2,2)];
   constructor() {
      for (let i = 0; i < this.shipLength - 1; i++) {
         if(this.vertical) {
               this.positions.push(new Vec(this.positions[i].x + 1, this.positions[0].y));
         } else {
            this.positions.push(new Vec(this.positions[i].x, this.positions[i].y + 1));
         }
         console.log("plotting ship vectors", this.positions);
      }
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

