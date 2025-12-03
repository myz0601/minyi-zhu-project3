import { useSudoku } from "./SudokuContext";
import Cell from "./Cell";


export default function Board() {
  const { state } = useSudoku();
  const {
    curr_board,
    bool_init,
    conflicts,
    size,
    blockCols,
    blockRows,
    hint,
  } = state;

  return (
    <div
      className="board"
      style={{ "--n": size }}
    >
      {curr_board.map((row, r) =>
        row.map((val, c) => {
          // thick borders between subgrids
          const boxRight =
            (c + 1) % blockCols === 0 && c !== size - 1 ? " box-right" : "";
          const boxBottom =
            (r + 1) % blockRows === 0 && r !== size - 1 ? " box-bottom" : "";

          const key = r + "-" + c;
          const isError = conflicts.has(r + "-" + c);
          const isHintCell = !!(
            hint &&
            hint.r === r &&
            hint.c === c
          );

          return (
            <Cell
              key={key}
              r={r}
              c={c}
              value={val}
              // true if this cell was part of the initial puzzle (cannot edit)
              bool_init={!!bool_init[r][c]}
              // mark cell as conflicting if it appears in the conflict set
              error={isError}
              // highlight cell if it matches the current hint position
              isHint={isHintCell}
              extraClass={boxRight + boxBottom}
            />
          );
        })
      )}
    </div>
  );
}
