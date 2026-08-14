import Vec from "./vector.js";
import { Board } from "./board.js";

/**
 * Static definition of a ship type.
 * @typedef {{name: string, len: number, color: string}} ShipDef
 */

/**
 * A single ship: picks its own spot on the board and tracks hits taken.
 */
class Ship {
    vertical;
    shipLength;
    class;
    hits = 0;
    /** @type {Vec[]} */
    positions = [];

    /**
     * Places the ship at a random valid position on the given board.
     * @param {object} params
     * @param {(number|string)[][]} params.boardState - Board grid; 0 = empty cell.
     * @param {ShipDef} params.ship - Which ship to build.
     */
    constructor({ boardState, ship }) {
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

    /**
     * Rolls random origins until one fits the whole ship without collisions.
     * @param {(number|string)[][]} boardState
     * @returns {Vec} A valid origin cell for the ship.
     */
    createSeed(boardState) {
       let isSeedInvalid = true;
       let seedX;
       let seedY;

       while(isSeedInvalid) {
          seedX = Math.floor(Math.random() * boardState.length);
          seedY = Math.floor(Math.random() * boardState.length);
          isSeedInvalid = !this.validateSeed({ seedX, seedY, boardState, shipLength: this.shipLength, vertical: this.vertical });
       }
       return new Vec(seedX, seedY);
    }

    /**
     * @param {object} params
     * @param {number} params.seedX - Candidate origin row.
     * @param {number} params.seedY - Candidate origin column.
     * @param {(number|string)[][]} params.boardState
     * @param {number} params.shipLength
     * @param {boolean} params.vertical
     * @returns {boolean} True when the ship fits in bounds with no overlap.
     */
    validateSeed({ seedX, seedY, boardState, shipLength, vertical }) {
       let isValid = false;
       // check that the ship is in bounds, if not return early
       if (vertical) {
          if (seedX + shipLength > boardState.length){
             return isValid;
          }
       } else {
          if (seedY + shipLength > boardState.length) {
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

    /** @returns {boolean} True once hits equal ship length. */
    get isSunk() {
       return this.hits === this.shipLength;
    }

    /** @returns {Vec[]} Every cell this ship occupies. */
    getPos() {
       return this.positions;
    }
 }

 class ShipOptions {
   
   /** @type {ShipDef[]}} */
   ships;
   boundHandleDrag
   parent;

   /**
    * Places the ship at a random valid position on the given board.
    * @param {object} params
    * @param {Board} params.board - Board grid; 0 = empty cell.
    * @param {ShipDef[]} params.ships - Which ship to build.
    * @param {HTMLElement} params.parent - Element that will contain the ships.
    */
   
   constructor({board, ships, parent}) {
      this.ships = ships
      this.boundHandleDrag = this.handleDrag.bind(this);
      this.parent = parent;
      ships.map((ship) => {
         this.renderOption({ option: ship, parent: parent });
      })
   }

   /**
    * Creates an element for a given ship.
    * @param {object} params
    * @param {ShipDef} params.option 
    * @param {HTMLElement} params.parent
    */
   renderOption({ option, parent }) {
      const optionElement = document.createElement("div");
      optionElement.classList.add(option.name);
      optionElement.draggable = true;
      optionElement.addEventListener("dragstart", this.boundHandleDrag);
      parent.appendChild(optionElement);
   }


   /**
    * Click handler for a cell: resolves the guess as miss, repeat, or hit.
    * @param {DragEvent & { target: HTMLElement, srcElement: HTMLElement }} e - The cell click event.
    */
   handleDrag(e) {
      console.log("dragged: ", e);
      // sample data for handling drag data
//         ev.dataTransfer.setData("text/plain", ev.target.innerText);
//   ev.dataTransfer.setData("text/html", ev.target.outerHTML);
//   ev.dataTransfer.setData(
//     "text/uri-list",
//     ev.target.ownerDocument.location.href,
//   );
   }

 }

export { Ship, ShipOptions };
