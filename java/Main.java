// Battleship — build the classic game in the console.
//
// THE MAP: read the Thought Process in README.md first. Then work the
// steps below in order, running as you go:  javac Main.java && java Main
// Checkpoints at the bottom show you when each layer works.

import java.util.*;

class Main {

    // ── The vocabulary of the game — given, so we all speak the same language ──

    enum Orientation {
        VERTICAL, HORIZONTAL
    }

    enum ShipType {
        DESTROYER, SUBMARINE, CRUISER, BATTLESHIP, CARRIER
    }

    enum CellState {
        HIT, MISS, SHIP, EMPTY
    }

    // Display constants — change the markers if you have better taste than us
    static final int    DIM          = 10;
    static final String EMPTY_MARKER = "◯";
    static final String MISS_MARKER  = "⤫";
    static final String HIT_MARKER   = "⏺";
    static final String SHIP_MARKER  = "☸";

    // STEP 2: the classic fleet lengths — destroyer 2, submarine 3, cruiser 3,
    //         battleship 4, carrier 5
    static final Map<ShipType, Integer> SHIP_LENGTHS = new EnumMap<>(ShipType.class);
    static {
        // TODO — one entry per ShipType
    }


    static class Ship {
        // STEP 1: a ship needs to know...
        //   - its length
        //   - its position: row and col for its top-left cell
        //   - its orientation: Orientation.HORIZONTAL or VERTICAL
        //   - whether it has been placed on a board yet
        //   - how close it is to sinking (hp starts at length, counts down;
        //     at 0 the ship is sunk)
        int length;
        int row, col;
        Orientation orientation;
        boolean placed;
        int hp;

        Ship(int length) {
            // TODO
        }
    }

    // STEP 2 (continued): build a fresh fleet — one new Ship per ShipType,
    //   using SHIP_LENGTHS. Called by Board() so each board gets its own
    //   independent ships (no shared-reference bugs like Python's deepcopy pitfall).
    static EnumMap<ShipType, Ship> makeFleet() {
        // TODO
        return new EnumMap<>(ShipType.class);
    }


    static class Board {
        // A board owns two things (see Thought Process #2 — data vs display):
        //   ships — its own fleet from makeFleet()
        //   hits  — a DIM×DIM grid of CellState tracking every shot, all EMPTY to start

        EnumMap<ShipType, Ship> ships;
        CellState[][] hits;

        Board() {
            // STEP 3: init ships and hits
            // TODO
        }

        // STEP 4: combine hits and ship positions into one grid for display.
        //   Start from a copy of hits, then stamp CellState.SHIP over every cell
        //   a placed ship covers. If addShips is false, skip the stamping —
        //   that's what your opponent sees.
        CellState[][] buildBoardState(boolean addShips) {
            // TODO
            return null;
        }

        // STEP 5: print the grid — column numbers 0-9 across the top, row
        //   letters A-J down the side ((char)('A' + i) is your friend),
        //   one marker per cell.
        //   Expected look: checkpoint 1 in the README.
        void show(boolean showShips) {
            // TODO
        }

        void show() { show(false); }

        // STEP 6: the rules of placement (Thought Process #5 — this is the tricky one):
        //   - the whole ship must fit on the board (check the far end!)
        //   - it can't overlap a ship that's already placed
        //   If the spot is bad, return false and change nothing.
        //   If it's good: save row/col/orientation on the ship, mark it placed,
        //   return true.
        boolean placeShip(ShipType type, int row, int col, Orientation orientation) {
            // TODO
            return false;
        }

        // STEP 7: ready = every ship in the fleet has been placed
        boolean isReady() {
            // TODO
            return false;
        }

        // STEP 8: did a shot at this position hit a ship?
        //   For now just return true (hit) or false (miss).
        //   Milestone 1 below will grow this: record the shot in hits,
        //   damage the ship, detect sinking.
        boolean makeGuess(int row, int col) {
            // TODO
            return false;
        }
    }


    // ── THE GAME — once the checkpoints pass, make the pieces play ──
    // (milestones, in order:)
    //
    //   1. Upgrade makeGuess: record HIT/MISS in hits, damage the ship (hp),
    //      mark it sunk at 0. Add isDefeated() — true when the whole fleet is sunk.
    //   2. parsePosition("B4") -> int[]{1, 4}. Reject bad input and repeat guesses.
    //   3. randomPlaceAll(board) — random spot + orientation per ship, retry
    //      until placeShip returns true.
    //   4. play() — the loop: show boards, your shot (Scanner input), CPU's random
    //      shot, first fleet fully sunk loses.
    //
    // static void play() { ... }


    public static void main(String[] args) {
        // ✅ CHECKPOINT 1 — two empty boards (steps 1-5).
        //    Expected output: README. Don't move on until yours matches.
        Board myBoard  = new Board();
        Board cpuBoard = new Board();
        cpuBoard.show();
        System.out.println("\n---------------------\n");
        myBoard.show(true);

        // ✅ CHECKPOINT 2 — place the fleet (steps 6-7). Ready flips to true
        //    only when all five ships are down. Try an off-board or overlapping
        //    placement — it should return false and change nothing.
        // myBoard.placeShip(ShipType.CARRIER,    0, 0, Orientation.VERTICAL);
        // myBoard.placeShip(ShipType.SUBMARINE,  0, 1, Orientation.VERTICAL);
        // System.out.println("Ready: " + myBoard.isReady());   // false — three to go
        // myBoard.placeShip(ShipType.BATTLESHIP, 0, 2, Orientation.VERTICAL);
        // myBoard.placeShip(ShipType.DESTROYER,  0, 3, Orientation.VERTICAL);
        // myBoard.placeShip(ShipType.CRUISER,    0, 4, Orientation.VERTICAL);
        // myBoard.show(true);
        // System.out.println("Ready: " + myBoard.isReady());   // true

        // ✅ CHECKPOINT 3 — take a shot (step 8).
        //    (2, 1) is part of the submarine placed above — hit.
        //    (3, 1) is open water — miss.
        // System.out.println("Hit: " + myBoard.makeGuess(2, 1));   // true
        // System.out.println("Hit: " + myBoard.makeGuess(3, 1));   // false

        // Then: milestones. Uncomment when play() exists.
        // play();
    }
}
