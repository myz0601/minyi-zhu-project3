import { useSudoku } from "./SudokuContext";

export default function Controls() {
  const { state, dispatch } = useSudoku();

  function handleReset() {
    dispatch({ type: "RESET" });
  }

  function handleHint() {
    dispatch({ type: "FIND_HINT" });
  }

  return (
    <div className="controls">
      <button className="btn" onClick={handleReset} disabled={state.locked}>
        Reset
      </button>
      
      <button
        className="btn"
        onClick={handleHint}
        disabled={state.locked}
      >
        Hint
      </button>
    </div>
  );
}
