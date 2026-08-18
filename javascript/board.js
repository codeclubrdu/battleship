import { Ship } from "./ship.js";
import Vec from "./vector.js";

/**
 * Base board: owns render, size, and validation logic for preparing
 * a board
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

   /**
    * @param {object} params
    * @param {Element} params.boardContainer - DOM element the grid renders into.
    * @param {import("./game.js").Game} params.game - Owning game, notified of guesses and sinks.
    * @param {number} params.size - Grid dimension (size x size).
    */
   constructor({ boardContainer, game, size }) {
      this.game = game;
      this.cols = size;
      this.rows = size;
      this.boardState = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      this.boardContainer = boardContainer;
   }

   /**
    * Creates a DOM cell for every board position and appends it to the container.
    */
   renderBoardState() {
      this.boardContainer.innerHTML = "";
      this.boardPieces = [];
      this.boardState.map((row, indexX) => {
         row.map((value, indexY) => {
            const piece = this.createPiece({ parent: this.boardContainer, value: value, position: new Vec(indexX, indexY) });
            this.boardPieces.push(piece);
         })
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
    * A placement is valid when every cell is on the board and unoccupied.
    * @param {Vec[]} positions - Candidate cells for a ship.
    * @returns {boolean}
    */
   isValidPlacement(positions) {
      return positions.every((pos) =>
         pos.x >= 0 && pos.x < this.rows &&
         pos.y >= 0 && pos.y < this.cols &&
         this.boardState[pos.x][pos.y] === 0
      );
   }

   /**
    * Commits a ship to the board: tracks it and stamps its cells into boardState.
    * Assumes the placement was already validated.
    * @param {Ship} ship
    */
   placeShip(ship) {
      this.ships.push(ship);
      ship.getPos().forEach((pos) => {
         this.boardState[pos.x][pos.y] = ship.class;
      })
   }

   /**
    * Rolls random origins and orientations until one fits, then builds the ship.
    * @param {import("./ship.js").ShipDef} shipDef
    * @returns {Ship}
    */
   placeShipRandomly(shipDef) {
      let origin;
      let vertical;
      let positions;
      do {
         vertical = Math.random() < 0.5;
         origin = new Vec(Math.floor(Math.random() * this.rows), Math.floor(Math.random() * this.cols));
         positions = Ship.calculatePositions({ origin, len: shipDef.len, vertical });
      } while (!this.isValidPlacement(positions));
      return new Ship({ ship: shipDef, origin, vertical });
   }


   /**
    * @param {Vec} position
    * @returns {{value: boolean, location: string}} Whether the cell is a corner, and which one.
    */
   checkCornerPiece(position) {
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
   checkEdgePiece(position) {
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
   createPiece({ parent, value, position }) {
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
      parent.appendChild(divEl);
      return divEl;
   }
}

/**
 * Used for handling placement of ships onto board
 */
class PlacementBoard extends Board {
   boundHandleDrop;
   boundHandleDragover;
   shipDefs;

   /**
    * @param {object} params
    * @param {Element} params.boardContainer - DOM element the grid renders into.
    * @param {import("./game.js").Game} params.game - Owning game, notified of guesses and sinks.
    * @param {number} params.size - Grid dimension (size x size).
    * @param {import("./ship.js").ShipDef[]} params.shipDefs - Base ship definition
    */
   constructor({ boardContainer, game, size, shipDefs }) {
      super({ boardContainer, game, size })
      this.shipDefs = shipDefs;
      this.boundHandleDragover = this.handleDragover.bind(this);
      this.boundHandleDrop = this.handleDrop.bind(this);
      this.renderBoardState()
   }

   renderBoardControls() {}

   /**
    * Builds one DOM cell: position data, corner/edge/ship/hit/miss classes, click handler.
    * @param {object} params
    * @param {Element} params.parent - Container to append the cell to.
    * @param {number|string} params.value - Cell state (ship name string renders the ship class).
    * @param {Vec} params.position - Cell coordinates.
    * @returns {HTMLElement} The created cell element.
    */
   createPiece({ parent, value, position }) {
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
      divEl.addEventListener("dragover", this.boundHandleDragover);
      divEl.addEventListener("drop", this.boundHandleDrop);
      parent.appendChild(divEl);
      return divEl;
   }
   
   /**
    * Shortcomming of the drag and drop DOM API, we have to listen for this event and then prevent default.
    * @param {DragEvent & { target: HTMLElement, srcElement: HTMLElement }} event 
    */
   handleDragover(event) {
      event.preventDefault();
   }
   
   /**
    * Drop handler for a cell: takes in the ship data transfer from the drag start ship option.
    * @param {DragEvent & { target: HTMLElement, srcElement: HTMLElement }} event 
    */
   handleDrop(event) {
      event.preventDefault();
      /** @type {import("./ship.js").ShipOptionInfo}*/
      const shipData = JSON.parse(event.dataTransfer.getData("text/json"));
      // check if ship has already been placed on board
      // update message if so
      const targetElementPosition = JSON.parse(event.target.dataset.position);
      const targetPosition = new Vec(targetElementPosition.x, targetElementPosition.y);
      const origin = this.#calculateProposedOrigin({ shipInfo: shipData, position: targetPosition });
      const proposedPositions = Ship.calculatePositions({ origin, len: shipData.len, vertical: shipData.isVert });
      if (!this.isValidPlacement(proposedPositions)) {
         return;
      }
      const shipDef = this.shipDefs.find((def) => def.name === shipData.name);
      this.placeShip(new Ship({ ship: shipDef, origin, vertical: shipData.isVert }));
      this.renderBoardState();
   }
   /**
    * Internal method for calculating all proposed starting position for a given ship info option
    * @param {object} params
    * @param {import("./ship.js").ShipOptionInfo} params.shipInfo
    * @param {Vec} params.position
    * @returns {Vec}
    */
   #calculateProposedOrigin({ shipInfo, position }) {
      const { isVert, offset } = shipInfo;
      const { x , y } = position; 
      return isVert ? new Vec(x - offset, y) : new Vec(x, y - offset);
   }
}


/**
 * One battleship grid: owns the cell state, the ships on it, and the DOM cells.
 * Cell values: 0 = empty, 1 = miss, 2 = hit, ship name string = unhit ship.
 */
class GuessBoard extends Board {
   
  /** @type {GuessBoard["checkHit"]} */
   boundCheckHit;

   constructor({ boardContainer, game, ships, size }) {
      super({ boardContainer, game, size }) 
      this.boundCheckHit = this.checkHit.bind(this);
      ships.forEach((shipBase) => {
         this.placeShip(this.placeShipRandomly(shipBase));
      })
      this.renderBoardState();
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
         this.game.onGuess();
         this.game.render({ message: "Hit!"});
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
    * Builds one DOM cell: position data, corner/edge/ship/hit/miss classes, click handler.
    * @param {object} params
    * @param {Element} params.parent - Container to append the cell to.
    * @param {number|string} params.value - Cell state (ship name string renders the ship class).
    * @param {Vec} params.position - Cell coordinates.
    * @returns {HTMLElement} The created cell element.
    */
   createPiece({ parent, value, position }) {
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
}

export { PlacementBoard, GuessBoard, Board};
