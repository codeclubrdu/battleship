// set grid rows and columns and the size of each square
var rows = 10;
var cols = 10;
var squareSize = 50;

// get the container element
var gameBoardContainer = document.getElementById("gameboard");

// make the grid columns and rows
for (let row = 0; row < 10; row++) {
   const test = document.createElement("div");
   test.textContent = "0"
   gameBoardContainer.appendChild(test);
};



/* lazy way of tracking when the game is won: just increment hitCount on every hit
   in this version, and according to the official Hasbro rules (http://www.hasbro.com/common/instruct/BattleShip_(2002).PDF)
   there are 17 hits to be made in order to win the game:
      Carrier     - 5 hits
      Battleship  - 4 hits
      Destroyer   - 3 hits
      Submarine   - 3 hits
      Patrol Boat - 2 hits
*/

/* create the 2d array that will contain the status of each square on the board
   and place ships on the board (later, create function for random placement!)

   0 = empty, 1 = part of a ship, 2 = a sunken part of a ship, 3 = a missed shot
*/

