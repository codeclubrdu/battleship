import Vec from "./vector.js";
import { Board } from "./board.js";

/**
 * Static definition of a ship type.
 * @typedef {{name: string, len: number, color: string}} ShipDef
 * @typedef {{ name: string, len: number, offset: number, isVert: boolean }} ShipOptionInfo
 */


class Ship {
    vertical;
    shipLength;
    class;
    hits = 0;
    /** @type {Vec[]} */
    positions = [];

    /**
     * @param {object} params
     * @param {ShipDef} params.ship - Which ship to build.
     * @param {Vec} params.origin - Bow cell the ship extends from.
     * @param {boolean} params.vertical - Extends down when true, right when false.
     */
    constructor({ ship, origin, vertical }) {
       this.vertical = vertical;
       this.shipLength = ship.len;
       this.class = ship.name;
       this.positions = Ship.calculatePositions({ origin, len: ship.len, vertical });
    }

    /**
     * Cells a ship of the given length would cover from origin.
     * @param {object} params
     * @param {Vec} params.origin
     * @param {number} params.len
     * @param {boolean} params.vertical
     * @returns {Vec[]}
     */
    static calculatePositions({ origin, len, vertical }) {
       const positions = [];
       for (let i = 0; i < len; i++) {
          positions.push(vertical ? new Vec(origin.x + i, origin.y) : new Vec(origin.x, origin.y + i));
       }
       return positions;
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
   boundHandleDrag;
   boundHandleMouseDown;
   boundHandleRotate;
   parent;
   offset;
   isVert = false;

   /**
    * Places the ship at a random valid position on the given board.
    * @param {object} params
    * @param {ShipDef[]} params.ships - Which ship to build.
    * @param {HTMLElement} params.parent - Element that will contain the ships.
    */
   
   constructor({ ships, parent }) {
      this.ships = ships
      this.boundHandleDrag = this.handleDrag.bind(this);
      this.boundHandleMouseDown = this.handleMouseDown.bind(this);
      this.boundHandleRotate = this.handleRotate.bind(this);
      this.parent = parent;
      ships.map((ship) => {
         this.renderOption({ option: ship, parent: parent });
      })
      this.#renderRotateButton();
   }


   /**
    * Creates an element for a given ship.
    * @param {object} params
    * @param {ShipDef} params.option 
    * @param {HTMLElement} params.parent
    */
   renderOption({ option, parent }) {
      const title = document.createElement("div");
      title.innerText = option.name.charAt(0).toUpperCase() + option.name.slice(1);
      parent.appendChild(title);
      const optionElement = document.createElement("div");
      optionElement.dataset.shipInfo = JSON.stringify(option);
      optionElement.draggable = true;
      optionElement.addEventListener("mousedown", this.boundHandleMouseDown);
      optionElement.addEventListener("dragstart", this.boundHandleDrag);

      for (let i = 0; i < option.len; i++) {
         const piece = document.createElement("div");
         piece.classList.add(option.name);
         piece.setAttribute("data-option-piece", i.toString());
         optionElement.appendChild(piece);
      }

      parent.appendChild(optionElement);

      // add a rotate button
   }

   handleMouseDown(event) {
      this.offset = Number(event.target.dataset.optionPiece);
   }

   /**
    * @param {DragEvent & { target: HTMLElement, srcElement: HTMLElement }} event - The cell click event.
    */
   handleDrag(event) {
      const optionInfo = JSON.parse(event.target.dataset.shipInfo);
      optionInfo.offset = this.offset;
      optionInfo.isVert = this.isVert;
      event.dataTransfer.setData("text/json", JSON.stringify(optionInfo));
   }
   

   /**
    * @param {MouseEvent & { target: HTMLElement, srcElement: HTMLElement }} event - The cell click event.
    */
   handleRotate(event) {
     console.log("rotating") 
     // we need to store references to each ship option
     // 
   }

   // destroy self
   destoryShip() {
      
   }

   #renderRotateButton() {
      const button = document.createElement("button");
      button.classList.add("rotate-btn");
      button.innerText = "Rotate";
      button.addEventListener("click", this.boundHandleRotate);
      this.parent.appendChild(button);
   }

 }

export { Ship, ShipOptions };
