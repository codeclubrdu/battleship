/**
 * CPU opponent (work in progress): will pick guesses against the player's board.
 */
class Actor {
    difficulty;
    /**
     * @param {string} difficulty - Difficulty key controlling guess strategy.
     */
    constructor(difficulty) {
       this.difficulty = difficulty;
    }

    /**
     * Picks the CPU's next guess. Not implemented yet.
     */
    guess() {

    }
}

export { Actor };
