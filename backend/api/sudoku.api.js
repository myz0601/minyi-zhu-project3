import express from "express";
import SudokuGame from "../db/model/sudoku.model.js";
import { wrapAsync } from "./utils.js";
import { buildSudoku } from "./sudoku.utils.js";

const router = express.Router();

const ADJECTIVES = [
  "Brave", "Silent", "Lucky", "Curious", "Gentle",
  "Swift", "Misty", "Happy", "Cozy", "Secret",
];

const COLORS = [
  "Red", "Blue", "Green", "Yellow", "Purple",
  "Orange", "Silver", "Golden", "Azure", "Indigo",
];

const NOUNS = [
  "Tiger", "House", "Ocean", "Forest", "Mountain",
  "Garden", "Castle", "River", "Cloud", "Planet",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeName() {
  return `${rand(ADJECTIVES)} ${rand(COLORS)} ${rand(NOUNS)}`;
}

async function generateUniqueName() {
  for (let i = 0; i < 8; i += 1) {
    const candidate = makeName();
    const exists = await SudokuGame.exists({ name: candidate });
    if (!exists) return candidate;
  }
  return `Sudoku ${Date.now()}`;
}

/**
 * GET /api/sudoku
 */
router.get(
  "/sudoku",
  wrapAsync(async (req, res) => {
    const games = await SudokuGame.find(
      {},
      { name: 1, mode: 1, creator: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ games });
  })
);

/**
 * POST /api/sudoku
 */
router.post(
  "/sudoku",
  wrapAsync(async (req, res) => {
    let { mode } = req.body;

    let normalizedMode = String(mode || "EASY").toUpperCase();
    if (!["EASY", "NORMAL"].includes(normalizedMode)) {
      normalizedMode = "EASY";
    }

    const username = req.cookies.username || "Anonymous";

    const lower = normalizedMode.toLowerCase();
    const { puzzle, solution } = buildSudoku(lower);

    const name = await generateUniqueName();

    const game = await SudokuGame.create({
      name,
      mode: normalizedMode,
      creator: username,
      puzzle,
      solution,
      // isCompleted default false
    });

    res.status(201).json({
      id: game._id.toString(),
      name: game.name,
      mode: game.mode,
      creator: game.creator,
      createdAt: game.createdAt,
    });
  })
);

/**
 * GET /api/sudoku/:id
 */
router.get(
  "/sudoku/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const game = await SudokuGame.findById(id).lean();

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ game });
  })
);

/**
 * PUT /api/sudoku/:id
 */
router.put(
  "/sudoku/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const update = req.body || {};

    const game = await SudokuGame.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ game });
  })
);

/**
 * DELETE /api/sudoku/:id
 */
router.delete(
  "/sudoku/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deleted = await SudokuGame.findByIdAndDelete(id).lean();

    if (!deleted) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ success: true });
  })
);

export default router;
