import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import highscoreApi from "./backend/api/highscore.api.js";
import sudokuApi from "./backend/api/sudoku.api.js";
import userApi from "./backend/api/user.api.js";

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// connect to MongoDB
const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/sudoku";

mongoose.connect(MONGODB_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to MongoDB:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// API
app.use("/api", highscoreApi);
app.use("/api", sudokuApi);
app.use("/api", userApi);

const frontendDir = path.join(__dirname, "dist");

app.use(express.static(frontendDir));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
