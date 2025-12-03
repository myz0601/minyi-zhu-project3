import { generateGame } from "../../src/sudoku/logic.js";

export function buildSudoku(mode = "normal") {
  const m = String(mode || "normal").toLowerCase() === "easy" ? "easy" : "normal";

  const game = generateGame(m);
  const { size, blockRows, blockCols, init_board, final_board } = game;

  const puzzle = init_board.map((row) =>
    row.map((v) => (v == null ? 0 : v))
  );

  return {
    size,
    blockRows,
    blockCols,
    puzzle,
    solution: final_board,
  };
}
