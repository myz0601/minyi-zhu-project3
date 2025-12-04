import "../styles/common.css";
import "../styles/game.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SudokuProvider, useSudoku } from "../sudoku/SudokuContext";
import Board from "../sudoku/Board";
import Controls from "../sudoku/Controls";

function WinBanner({ mode }) {
  const { state } = useSudoku();
  if (state.status !== "won") return null;

  const label = mode === "EASY" ? "Easy" : "Normal";
  const isFromHistory = state.startedAt == null;
  const seconds = Math.round(state.elapsedMs / 1000);

  return (
    <div className="win-banner">
      <h2>Congratulations!</h2>
      {isFromHistory ? (
        <p>You solved this {label} Sudoku.</p>
      ) : (
        <p>You solved this {label} Sudoku in {seconds} seconds.</p>
      )}
    </div>
  );
}


function GameInner({ gameMeta, gameId }) {
  const { state } = useSudoku();
  const [reportedWin, setReportedWin] = useState(false);

  const title =
    gameMeta.mode === "EASY"
      ? "Good luck on Easy Sudoku!"
      : "Good luck on Normal Sudoku!";

  const wasCompleted = !!gameMeta.wasCompleted;

  useEffect(() => {
    if (wasCompleted) return;
    if (state.status !== "won") return;
    if (reportedWin) return; 

    setReportedWin(true);

    fetch(`/api/sudoku/${gameId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: true }),
    }).catch((err) => {
      console.error("Failed to mark sudoku completed:", err);
    });

    fetch("/api/highscore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    }).catch((err) => {
      console.error("Failed to update highscore:", err);
    });
  }, [state.status, reportedWin, gameId, wasCompleted]);

  return (
    <div className="game-wrapper">
      <h1 className="page-title">{title}</h1>
      <div className="game-layout">
        <Board />
      </div>
      <Controls />
      <WinBanner mode={gameMeta.mode} />
      {state.locked && (
        <div className="game-locked">
          <div className="game-locked-title">This game is completed.</div>
          <div className="game-locked-text">
            You can still review the solution, but the board is locked.
          </div>
        </div>
      )}
    </div>
  );
}


function convertGameFromApi(game, isCompletedForUser) {
  const puzzle = game.puzzle || [];
  const solution = game.solution || [];

  const size = puzzle.length || 9;
  const mode = game.mode || "NORMAL";

  let blockRows, blockCols;
  if (mode === "EASY") {
    blockRows = 2;
    blockCols = 3;
  } else {
    blockRows = 3;
    blockCols = 3;
  }

  const init_board = puzzle.map((row) =>
    row.map((v) => (v === 0 ? null : v))
  );
  const final_board = solution.map((row) =>
    row.map((v) => (v === 0 ? null : v))
  );

  return {
    mode: mode.toLowerCase(),
    size,
    blockRows,
    blockCols,
    init_board,
    final_board,
    isCompleted: !!isCompletedForUser,
  };
}

export default function GamePage() {
  const { gameId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialGame, setInitialGame] = useState(null);
  const [gameMeta, setGameMeta] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/user/isLoggedIn");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.username);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setUserLoaded(true);
      }
    }
    loadUser();
  }, []);


    useEffect(() => {
    if (!userLoaded) return;

    async function loadGame() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/sudoku/${gameId}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const game = data.game;
        if (!game) {
          throw new Error("Game not found");
        }

        const completedBy = game.completedBy || [];

        let wasCompletedForUser = false;

        if (currentUser) {
          wasCompletedForUser = completedBy.includes(currentUser);
        } else {
          wasCompletedForUser = false;
        }

        setInitialGame(convertGameFromApi(game, wasCompletedForUser));
        setGameMeta({
          mode: game.mode || "NORMAL",
          name: game.name,
          wasCompleted: wasCompletedForUser,
        });
      } catch (err) {
        console.error("Failed to load game:", err);
        setError("Failed to load game. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [gameId, userLoaded, currentUser]);


  return (
    <>
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container game-card">
        {loading && <p className="game-status">Loading game...</p>}
        {error && <p className="game-status game-error">{error}</p>}

        {!loading && !error && initialGame && gameMeta && (
          <SudokuProvider initialGame={initialGame}>
            <GameInner gameMeta={gameMeta} gameId={gameId} />
          </SudokuProvider>
        )}
      </div>
    </>
  );
}
