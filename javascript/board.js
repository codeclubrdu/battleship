import Ship from "./ship.js";
import Vec from "./vector.js";

/**
 * One battleship grid: owns the cell state, the ships on it, and the DOM cells.
 * Cell values: 0 = empty, 1 = miss, 2 = hit, ship name string = unhit ship.
 */
class Board {

   boardContainer;
   /** @type {Ship[]} */
   ships = [];
   /** @type {HTMLElement[]} */
   boardPieces = [];
   /** @type {(number|string)[][]} */
   boardState;
   game;
   boundCheckHit;

   /**
    * @param {object} params
    * @param {Element} params.boardContainer - DOM element the grid renders into.
    * @param {import("./game.js").Game} params.game - Owning game, notified of guesses and sinks.
    * @param {import("./ship.js").ShipDef[]} params.ships - Fleet to place on the board.
    * @param {number} params.size - Grid dimension (size x size).
    */
   constructor({ boardContainer, game, ships, size }) {
      this.game = game;
      this.cols = size;
      this.rows = size;
      this.boundCheckHit = this.checkHit.bind(this);
      this.boardState = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      ships.forEach((shipBase) => {
         const ship = new Ship({ boardState: this.boardState, ship: shipBase });
         this.ships.push(ship);
         ship.getPos().forEach((pos) => {
            this.boardState[pos.x][pos.y] = shipBase.name;
         })
      })
      this.boardContainer = boardContainer;
      this.renderGrid();
   }

   /**
    * Creates a DOM cell for every board position and appends it to the container.
    */
   renderGrid() {
      this.boardState.map((row, indexX) => {
         row.map((value, indexY) => {
            const piece = this.#createPiece({ parent: this.boardContainer, value: value, position: new Vec(indexX, indexY) });
            this.boardPieces.push(piece);
         })
      })
   }

   /**
    * Click handler for a cell: resolves the guess as miss, repeat, or hit.
    * @param {MouseEvent & { target: HTMLElement, srcElement: HTMLElement }} element - The cell click event.
    */
   checkHit(element) {
      const position = JSON.parse(element.target.dataset.position);
      const value = this.boardState[position.x][position.y];
      if (value === 0) {
         this.game.onGuess();
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
         this.game.onGuess();
         element.srcElement.classList.add("hit");
         const shipName = this.boardState[position.x][position.y]
         const shipHit = this.ships.find((ship) => ship.class === shipName);
         shipHit.incrementHit();
         if (shipHit.isSunk) {
            this.game.shipSank(shipHit.class);
         }
         this.updateBoardState(2, position);
         return;
      }
   }

   /**
    * Removes the click handler from every cell so no further guesses register.
    */
   deactivateBoard() {
      this.boardPieces.forEach((piece) => {
         piece.removeEventListener("click", this.boundCheckHit);
      })
   }

   /**
    * @param {number} result - New cell value: 1 = miss, 2 = hit.
    * @param {Vec} position - Cell to update.
    */
   updateBoardState(result, position) {
      this.boardState[position.x][position.y] = result;
   }


   /**
    * @param {Vec} position
    * @returns {{value: boolean, location: string}} Whether the cell is a corner, and which one.
    */
   #checkCornerPiece(position) {
      if (position.x === 0 && position.y === 0) {
         return { value: true, location: "top-left"}
      } else if (position.x === 0 && position.y === this.cols - 1) {
         return { value: true, location: "top-right"}
      } else if (position.x === this.rows - 1  && position.y === 0) {
         return { value: true, location: "bottom-left"}
      } else if (position.x === this.rows - 1  && position.y === this.cols - 1) {
         return { value: true, location: "bottom-right"}
      } else {
         return { value: false, location: ""};
      }
   }

   /**
    * @param {Vec} position
    * @returns {{value: boolean, location: string}} Whether the cell is on an edge, and which side.
    */
   #checkEdgePiece(position) {
      if (position.x === 0 ) {
         return { value: true, location: "top"}
      } else if (position.y === this.cols - 1 ) {
         return { value: true, location: "right"}
      } else if (position.y === 0 ) {
         return { value: true, location: "left"}
      } else if (position.x === this.rows - 1) {
         return { value: true, location: "bottom"}
      } else {
         return { value: false, location: ""};
      }
   }

   /**
    * Builds one DOM cell: position data, corner/edge/ship/hit/miss classes, click handler.
    * @param {object} params
    * @param {Element} params.parent - Container to append the cell to.
    * @param {number|string} params.value - Cell state (ship name string renders the ship class).
    * @param {Vec} params.position - Cell coordinates.
    * @returns {HTMLElement} The created cell element.
    */
   #createPiece({ parent, value, position }) {
      const divEl = document.createElement("div");
      divEl.dataset.position = JSON.stringify(position);
      const isCornerPiece = this.#checkCornerPiece(position);
      const isEdgePiece = this.#checkEdgePiece(position);
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
}

export default Board;
