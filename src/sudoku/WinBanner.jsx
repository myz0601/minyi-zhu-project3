import { useSudoku } from "./SudokuContext";

export default function WinBanner() {
  const { state } = useSudoku();

  if (state.status !== "won") {
    return null;
  }

  return (
    <div className="win-banner">
      Congratulations! Puzzle solved.
    </div>
  );
}
