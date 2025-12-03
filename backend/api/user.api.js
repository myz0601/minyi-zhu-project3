import express from "express";
import bcrypt from "bcryptjs";
import User from "../db/model/user.model.js";
import { wrapAsync } from "./utils.js";

const router = express.Router();

/**
 * GET /api/user/isLoggedIn
 */
router.get(
  "/user/isLoggedIn",
  wrapAsync(async (req, res) => {
    const username = req.cookies.username;
    if (!username) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.clearCookie("username");
      return res.status(401).json({ error: "Not logged in" });
    }

    return res.json({ username });
  })
);

/**
 * POST /api/user/register
 * body: { username, password }
 */
router.post(
  "/user/register",
  wrapAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Missing username or password" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash,
      wins: 0,
    });

    res.cookie("username", username, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(201).json({ username: user.username });
  })
);

/**
 * POST /api/user/login
 * body: { username, password }
 */
router.post(
  "/user/login",
  wrapAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Missing username or password" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ error: "Invalid username or password" });
    }

    res.cookie("username", username, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.json({ username });
  })
);

/**
 * POST /api/logout
 */
router.post(
  "/logout",
  wrapAsync(async (req, res) => {
    res.clearCookie("username");
    return res.json({ success: true });
  })
);

export default router;
