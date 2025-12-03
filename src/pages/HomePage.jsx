import "../styles/common.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function useBodyClass(cls) {
  useEffect(function () {
    document.body.classList.add(cls);
    return function () {
      document.body.classList.remove(cls);
    };
  }, [cls]);
}

export default function HomePage() {
  useBodyClass("home");

  return (
    <div className="hero">
      <img src="/images/bg1.jpg" alt="Sudoku background" className="bg-img" />

      <div className="container hero-inner">
        <h1>Welcome to Sudoku Game!</h1>
        <p style={{ textAlign: "center" }}>
          Enjoy solving and challenging your brain!
        </p>
      </div>
    </div>
  );
}
