import "../styles/common.css";
import "../styles/scores.css";
import { useEffect, useState } from "react";

function useBodyClass(cls) {
  useEffect(() => {
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

export default function ScoresPage() {
  useBodyClass("scores");

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHighscores() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/highscore");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setGames(data.games || []);
      } catch (err) {
        console.error("Failed to load highscores:", err);
        setError("Failed to load high scores. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadHighscores();
  }, []);

  return (
    <>
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container scores-card">
        <h1>Game High Scores</h1>

        {loading && <p className="scores-status">Loading...</p>}
        {error && <p className="scores-status scores-error">{error}</p>}

        {!loading && !error && games.length === 0 && (
          <p className="scores-status">
            No game has been completed yet. Be the first one!
          </p>
        )}

        {!loading && !error && games.length > 0 && (
          <table className="score-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Game Name</th>
                <th>Difficulty</th>
                <th>Times Completed</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g, idx) => (
                <tr key={g._id || g.gameId || idx}>
                  <td>{idx + 1}</td>
                  <td>{g.name}</td>
                  <td>{g.mode}</td>
                  <td>{g.completedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
