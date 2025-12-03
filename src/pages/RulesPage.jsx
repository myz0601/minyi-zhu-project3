import "../styles/common.css";
import "../styles/rules.css";
import { useEffect } from "react";

function useBodyClass(cls) {
  useEffect(() => {
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

export default function RulesPage() {
  useBodyClass("rules");

  return (
    <>
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container rules-card">
        <h1>Sudoku Rules</h1>

        <p>
          This app provides two Sudoku modes. The goal in both is the same:
          fill the entire grid so every row, every column, and every subgrid
          contains all required digits exactly once.
        </p>

        <h2>Board Sizes</h2>
        <ul>
          <li>
            <strong>Easy — 6×6</strong> (subgrids are 2×3): use digits 1–6.
          </li>
          <li>
            <strong>Normal — 9×9</strong> (subgrids are 3×3): use digits 1–9.
          </li>
        </ul>

        <h2>Placement Rules (Both Modes)</h2>
        <ol>
          <li>
            <strong>Rows:</strong> Each row must contain all allowed digits without repetition.
          </li>
          <li>
            <strong>Columns:</strong> Each column must contain all allowed digits without repetition.
          </li>
          <li>
            <strong>Subgrids:</strong> Each subgrid (2×3 in 6×6, 3×3 in 9×9) must contain all allowed digits without repetition.
          </li>
        </ol>

        <h2>How This App Works</h2>
        <ul>
          <li>
            <strong>Givens are locked:</strong> Cells pre-filled at the start cannot be edited.
          </li>
          <li>
            <strong>Valid inputs only:</strong> 6×6 accepts 1–6; 9×9 accepts 1–9.
            Other keys are ignored.
          </li>
          <li>
            <strong>Error highlight:</strong> If a value violates a row/column/subgrid rule, the cell border turns red.
          </li>
          <li>
            <strong>Change anytime / delete:</strong> You can overwrite a value, or clear with Backspace/Delete.
          </li>
          <li>
            <strong>New Game & Reset & Hint:</strong> “New Game” creates a fresh random puzzle; “Reset” restores the original givens; "Hint" highlights one empty cell that has a single valid candidate.
          </li>
          <li>
            <strong>Timer & Win:</strong> The timer starts when the board loads. When the board is validly complete,
            input locks and a congratulations message appears.
          </li>
        </ul>

        <h2>Credits</h2>
        <p>Made for a course project. Contact & profiles:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:zhu.miny@northeastern.com">zhu.miny@northeastern.com</a></li>
          <li><strong>GitHub:</strong> <a href="https://github.com/myz0601" target="_blank" rel="noreferrer">myz0601</a></li>
          <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/" target="_blank" rel="noreferrer">Minyi Zhu</a></li>
        </ul>
      </div>
    </>
  );
}
