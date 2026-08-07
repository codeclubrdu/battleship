from enum import Enum

class CellState(Enum):
    EMPTY = 0
    HIT = 1
    MISS = 2
    SHIP = 3


BOARD_SIZE = 10
CHARACTERS = {
    CellState.EMPTY: "◯",
    CellState.HIT: "⏺",
    CellState.MISS: "⤫",
    CellState.SHIP: "☸",
}

class Board:
    # cells[0] is the entire 1st row.
    # cells[0][1] is the cell located in the 1st row, 2nd column.
    cells = [[CellState.EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]

    def show(self):
        print(" ", end=" ")
        for i in range(BOARD_SIZE):
            print(i, end=" ")

        print()
        for i in range(BOARD_SIZE):
            print(chr(ord('A') + i), end=" ")
            for cell in self.cells[i]:
                print(CHARACTERS[cell], end=" ")

            print()


def play():
    while True:
        my_board = Board()
        cpu_board = Board()

        cpu_board.show()
        print("\n---------------------\n")
        my_board.show()

        guess = input("Input: ")
        print("Player entered:", guess)

if __name__ == "__main__":
    play()
