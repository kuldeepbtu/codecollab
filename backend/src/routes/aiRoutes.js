/**
 * AI Routes — SSE streaming endpoint for code assistance
 * Modes: ask, explain, debug, review, tests, refactor
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createAiStream, getAiStatus } from "../services/aiService.js";

const router = express.Router();

/**
 * GET /api/ai/status
 * Returns current AI provider status (configured or not)
 */
router.get("/status", (req, res) => {
  res.json({
    success: true,
    ai: getAiStatus(),
  });
});

/**
 * POST /api/ai/stream
 * Streams AI response via Server-Sent Events (SSE)
 *
 * Body: { roomId, mode, message, code, language, selection?, userName? }
 */
router.post("/stream", protect, async (req, res) => {
  const { roomId, mode, message, code, language, selection, userName } =
    req.body;

  if (!roomId || !mode || !message) {
    return res.status(400).json({
      success: false,
      message: "roomId, mode, and message are required.",
    });
  }

  try {
    // Set up SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const stream = createAiStream({
      roomId,
      mode,
      message,
      code: code || "",
      language: language || "javascript",
      selection,
      userName,
    });

    let fullContent = "";

    for await (const delta of stream) {
      fullContent += delta;
      res.write(`event: token\n`);
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }

    // Send completion event
    res.write(`event: done\n`);
    res.write(`data: ${JSON.stringify({ content: fullContent })}\n\n`);
    res.end();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "AI request failed.";

    if (!res.headersSent) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    // If SSE already started, send error event
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: errorMessage })}\n\n`);
    res.end();
  }
});

export default router;
