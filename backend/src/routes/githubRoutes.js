/**
 * GitHub Routes — Connect + Push to GitHub repositories
 * User provides their own GitHub PAT (Personal Access Token)
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  testGithubConnection,
  pushToGithub,
} from "../services/githubService.js";

const router = express.Router();

/**
 * POST /api/github/test
 * Test GitHub connection — verifies token, repo, and branch
 *
 * Body: { token, owner, repo, branch }
 */
router.post("/test", protect, async (req, res) => {
  const { token, owner, repo, branch } = req.body;

  if (!token || !owner || !repo || !branch) {
    return res.status(400).json({
      success: false,
      message: "token, owner, repo, and branch are required.",
    });
  }

  try {
    const result = await testGithubConnection({ token, owner, repo, branch });

    res.json({
      success: true,
      message: "GitHub connection successful",
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not connect to GitHub.",
    });
  }
});

/**
 * POST /api/github/push
 * Push a file to a GitHub repository
 *
 * Body: { token, owner, repo, branch, path, content, message }
 */
router.post("/push", protect, async (req, res) => {
  const { token, owner, repo, branch, path, content, message } = req.body;

  if (!token || !owner || !repo || !branch || !path || !content) {
    return res.status(400).json({
      success: false,
      message: "token, owner, repo, branch, path, and content are required.",
    });
  }

  try {
    const result = await pushToGithub({
      token,
      owner,
      repo,
      branch,
      path,
      content,
      message: message || `Update ${path} via CodeCollab`,
    });

    res.json({
      success: true,
      message: "File pushed to GitHub successfully",
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not push to GitHub.",
    });
  }
});

export default router;
