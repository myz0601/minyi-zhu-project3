import "../styles/common.css";
import "../styles/login.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useBodyClass(cls) {
  useEffect(() => {
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

export default function LoginPage({ setCurrentUser }) {
  useBodyClass("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed.");
        return;
      }

      setCurrentUser(data.username);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container login-card">
        <h1>Login</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}
