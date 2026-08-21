# Todo

The purpose of this document is to track all of the various ideas I have and keep them on track and prevent scope creep. 

- ending at needing to refactor gameboard. Either keep it as-is and all of it's styling or create a container to keep all of the necessary parent conatiner div's. 
edit: I think it's best to put this whole draggable board in it's own container and then just hide it. much easier than fighting styling that's still good. I think we'll also need to add another gameboard container for cpu, so maybe a style refactor is inevitable. 

- add descriptions for each element

- drag events are registering and I think I'm okay with keeping each ship a square. when a square is dropped it will have four arrows, where the user can choose a direction the ship spreads out. 

- we will need an undo button for drops made

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

These target the old multi-mode modules, which live only on `jordan/vs-cpu`
(`d1ef80f`) — the files no longer exist on `jordan/solve`:

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

Drag and drop Example: 
``` javascript
const target = document.getElementById("target");

// Cancel dragover so that drop can fire
target.addEventListener("dragover", (ev) => {
  ev.preventDefault();
});
target.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/plain");
  ev.target.append(data);
});
```
### PvP Notes
[notes](#pvp-notes)

**Goal:** play a friend on the same wifi without publishing a website. They open `http://<my-lan-ip>:8080` in a browser, that's it.

**Architecture — client-authoritative + dumb relay (decided):**
- Each browser keeps its OWN board + ships. Ship positions never cross the wire.
- A guess goes out as `{x, y}`; the opponent's client answers `hit | miss | sunk(shipName)`.
- Server = static file host + matchmaker + message pipe (~100 lines in any language). It never sees ship positions.
- Skipping authoritative server on purpose: 10x code for cheat-proofing we don't need on a couch.

**Wire protocol sketch (WebSocket, JSON messages):**
- `join` → server pairs first two sockets into a room
- `ready` (after placement) → both ready = server picks who goes first
- `guess {x, y}` → relayed to opponent
- `result {x, y, outcome}` → relayed back
- `gameover`, `rematch`, `opponent-disconnected`

**Stack — undecided. Trade-offs:**
- Go: single ~8MB binary, `go:embed` bakes the whole game into it, one-env-var cross-compile. Least ceremony. Front-runner.
- C#/.NET: static files + websockets built into ASP.NET Core, zero deps, cleanest code. ~70MB self-contained publish. Wins if .NET learning is job-relevant.
- Rust: axum/tokio, small binary. Most learning friction for a string-relay. Only if learning Rust is the point.
- Websockets regardless — browser-native, full-duplex, perfect for turn messages.

**Surfacing the other client:**
- Bind 0.0.0.0, print `http://<lan-ip>:8080` on startup (enumerate interfaces, skip loopback)
- Nice-to-have: QR code on the start screen for phones
- Nice-to-have: mDNS broadcast so friend types `battleship.local:8080` (spotty on Android)
- macOS will firewall-prompt on first run — expected, click allow

**Game-side prereqs (before any networking):**
- Turn state: `whoseTurn`, block input when it's not yours — falls out of Vs CPU work
- Two boards rendered: mine (shows my ships + their guesses) and theirs (fog, my guesses only)
- Stop leaking ships into the DOM: enemy board cells must not carry ship-name classes
- `PvpGame extends Game` with `onGuess` sending over the socket instead of hitting a local board

**Open decisions:**
- stack (above)
- rematch flow: same room or re-pair?
- disconnect mid-game: forfeit or wait for reconnect?


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