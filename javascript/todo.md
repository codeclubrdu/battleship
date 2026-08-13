# Todo

The purpose of this document is to track all of the various ideas I have and keep them on track and prevent scope creep. 

# Order
1) Add Vs CPU mode - in flight
2) Convert to approachable solve
    - Add JSDoc
3) PvP mode
4) Single mode updates

## Features
- PvP mode [notes](#pvp-notes)
- Vs CPU mode [notes](#vs-cpu-mode-notes)
- Single Mode updates
    - remove colors for ships
    - refine mode difficulty settings
    - add timer
    - play with board size for difficulty settings
- Convert to approachable solve
    - remove class implementation, favor functions to represent classes
    - remove multi-mode implementation
    - ~~add JSDoc to prevent bugs~~
    - add helpful comments

## Refactors
- ~~Add JSDoc~~ 
    - see [reference](#jsdoc)
- `ship.js` Ship seeding uses while loop, favor functional recursive approach
- `ship.js` Seed could be used once to prevent expensive `Math.random` call
- Move all win/loss logic out of `board.js` into `game.js`

## Reference: 

### Vs CPU Mode 
[notes](#vs-cpu-mode-notes)
play against an actor
   it needs to give the user a chance to set up their board 

**Steps required**
step one, user selects the game mode they want to play
user sets board from legend
user confirms ready to play
user created board transforms and user is prompted to go first
user selects a guess and sees result
actor makes guess and user sees result on board
during actor turn user cannot select anything on board
game ends when either player or actor has sunk all ships
   opposing board
user can select play again and is taken back to 
user can select change difficulty which takes them
   back to user create board

### PvP Notes
[notes](#pvp-notes)


### JSDoc:
[jsdoc](#jsdoc)

``` javascript
/**
 * Class representing a point.
 * @class
 * @classdesc A 2D coordinate point.
 */
class Point {
    /**
     * Create a point.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     */
    constructor(x, y) {
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    }

    /**
     * Get the x value.
     * @return {number} The x value.
     */
    getX() {
        return this.x;
    }

    /**
     * Convert a string into a point.
     * @param {string} str - The string containing two comma-separated numbers.
     * @return {Point} A Point object.
     */
    static fromString(str) {
        const [x, y] = str.split(',').map(Number);
        return new Point(x, y);
    }
}

/**
 * Class representing a dot extending Point.
 * @class
 * @extends Point
 */
class Dot extends Point {
    /**
     * Create a dot.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     * @param {number} width - The width of the dot.
     */
    constructor(x, y, width) {
        super(x, y);
        /** @type {number} */
        this.width = width;
    }
}   
```