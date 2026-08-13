/**
 * A 2D coordinate on the board grid.
 */
class Vec {
   x;
   y;
   /**
    * @param {number} x - Row index.
    * @param {number} y - Column index.
    */
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
}

export default Vec;
