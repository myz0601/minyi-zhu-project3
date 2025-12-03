import "../styles/common.css";
import "../styles/selection.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useBodyClass(cls) {
  useEffect(() => {
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

export default function SelectionPage() {
  useBodyClass("selection");
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/sudoku");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setGames(data.games || []);
      } catch (err) {
        console.error("Failed to load games:", err);
        setError("Failed to load games. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  async function handleCreate(mode) {
    try {
      setError("");

      const res = await fetch("/api/sudoku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      navigate(`/game/${data.id}`);
    } catch (err) {
      console.error("Failed to create game:", err);
      setError("Failed to create game. Please try again.");
    }
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container selection-card">
        <h1>Create a Game</h1>

        <div className="selection-actions">
          <button
            type="button"
            className="create-btn normal"
            onClick={() => handleCreate("NORMAL")}
          >
            Create Normal Game
          </button>
          <button
            type="button"
            className="create-btn easy"
            onClick={() => handleCreate("EASY")}
          >
            Create Easy Game
          </button>
        </div>

        {loading && <p className="selection-status">Loading games...</p>}
        {error && <p className="selection-status selection-error">{error}</p>}

        {!loading && !error && games.length === 0 && (
          <p className="selection-status">
            No games yet. Create one to get started!
          </p>
        )}

        {!loading && !error && games.length > 0 && (
          <table className="selection-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Difficulty</th>
                <th>Creator</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr
                  key={g._id}
                  className="selection-row"
                  onClick={() => navigate(`/game/${g._id}`)}
                >
                  <td>{g.name}</td>
                  <td>{g.mode}</td>
                  <td>{g.creator}</td>
                  <td>{formatDate(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
