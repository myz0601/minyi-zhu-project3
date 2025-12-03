import "../styles/common.css";
import "../styles/register.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useBodyClass(cls) {
  useEffect(() => {
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

export default function RegisterPage({ setCurrentUser }) {
  useBodyClass("register");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password || !confirm) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed.");
        return;
      }

      setCurrentUser(data.username);
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      setErrorMsg("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container register-card">
        <h1>Create an Account</h1>
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

          <label htmlFor="confirm-password">Verify Password</label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </>
  );
}
