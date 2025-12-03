import { NavLink, useNavigate } from "react-router-dom";
import "../styles/common.css";

export default function Navbar({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  const username =
    currentUser && typeof currentUser === "object"
      ? currentUser.username
      : currentUser || "";

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setCurrentUser(null);
      navigate("/");
    }
  }

  function handleProfileClick() {
  }

  return (
    <div className="navbar">
      <span className="logo">Sudoku Game</span>

      <input type="checkbox" id="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-icon">
        ☰
      </label>

      <div className="menu">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/games"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Game Selection
        </NavLink>
        <NavLink
          to="/rules"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Rules
        </NavLink>
        <NavLink
          to="/scores"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          High Scores
        </NavLink>

        <div className="nav-auth-area">
          {!username && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Register
              </NavLink>
            </>
          )}

          {username && (
            <>
              <button
                type="button"
                className="nav-logout-link"
                onClick={handleLogout}
              >
                Log out
              </button>

              <button
                type="button"
                className="nav-profile"
                onClick={handleProfileClick}
              >
                <span className="nav-profile-name">
                  {username}
                  <span className="nav-profile-arrow">▼</span>
                </span>
                <img
                  src="/images/icon.png"
                  alt="User avatar"
                  className="nav-profile-avatar"
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
