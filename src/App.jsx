import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import "./styles/common.css";
import Navbar from "./pages/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SelectionPage from "./pages/SelectionPage.jsx";
import RulesPage from "./pages/RulesPage.jsx";
import ScoresPage from "./pages/ScoresPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import GamePage from "./pages/GamePage.jsx";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch("/api/user/isLoggedIn", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.username);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("check login failed", e);
        setCurrentUser(null);
      } finally {
        setCheckingLogin(false);
      }
    }

    checkLogin();
  }, []);


  return (
    <BrowserRouter>
      <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<SelectionPage currentUser={currentUser} />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />}/>
        <Route path="/register" element={<RegisterPage setCurrentUser={setCurrentUser} />}/>
      </Routes>
    </BrowserRouter>
  );
}
