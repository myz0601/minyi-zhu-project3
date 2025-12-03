import express from "express";
import SudokuGame from "../db/model/sudoku.model.js";
import { wrapAsync } from "./utils.js";

const router = express.Router();

/**
 * GET /api/highscore
 */
router.get(
  "/highscore",
  wrapAsync(async (req, res) => {
    const games = await SudokuGame.find(
      { completedCount: { $gt: 0 } },
      { name: 1, mode: 1, completedCount: 1 }
    )
      .sort({ completedCount: -1, name: 1 })
      .lean();

    res.json({ games });
  })
);

/**
 * POST /api/highscore
 */
router.post(
  "/highscore",
  wrapAsync(async (req, res) => {
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ error: "Missing gameId" });
    }

    const game = await SudokuGame.findByIdAndUpdate(
      gameId,
      { $inc: { completedCount: 1 }, $set: { isCompleted: true } },
      { new: true }
    ).lean();

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({
      gameId: game._id.toString(),
      name: game.name,
      mode: game.mode,
      completedCount: game.completedCount,
    });
  })
);

/**
 * GET /api/highscore/:gameId
 */
router.get(
  "/highscore/:gameId",
  wrapAsync(async (req, res) => {
    const { gameId } = req.params;

    const game = await SudokuGame.findById(
      gameId,
      { name: 1, mode: 1, completedCount: 1 }
    ).lean();

    if (!game || game.completedCount === 0) {
      return res
        .status(404)
        .json({ error: "No high score for this game yet." });
    }

    res.json({
      gameId: game._id.toString(),
      name: game.name,
      mode: game.mode,
      completedCount: game.completedCount,
    });
  })
);

export default router;
