/**
 * AI Service — Handles AI streaming requests with mode-based prompts
 * Modes: ask, explain, debug, review, tests, refactor
 * Ported from Project 1 TypeScript to MERN JavaScript
 */

import { createAiProvider, MODE_INSTRUCTIONS } from "./aiProvider.js";
import {
  AI_MAX_INPUT_CHARS,
  AI_RATE_LIMIT_PER_ROOM,
  AI_RATE_LIMIT_WINDOW_MS,
} from "../config/env.js";

const aiProvider = createAiProvider();

// Per-room rate limiter (in-memory)
const requestTimesByRoom = new Map();

function clampText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n\n[Truncated to fit AI input budget]`;
}

function assertWithinRateLimit(roomId) {
  const now = Date.now();
  const windowStart = now - AI_RATE_LIMIT_WINDOW_MS;
  const recentTimes = (requestTimesByRoom.get(roomId) || []).filter(
    (t) => t >= windowStart
  );

  if (recentTimes.length >= AI_RATE_LIMIT_PER_ROOM) {
    throw new Error(
      "AI rate limit reached for this room. Try again in a moment."
    );
  }

  recentTimes.push(now);
  requestTimesByRoom.set(roomId, recentTimes);
}

/**
 * Creates an SSE stream for AI-powered code assistance
 * @param {Object} params
 * @param {string} params.roomId - Room identifier
 * @param {string} params.mode - One of: ask, explain, debug, review, tests, refactor
 * @param {string} params.message - User's question/request
 * @param {string} params.code - Current editor code
 * @param {string} params.language - Programming language
 * @param {string} [params.selection] - Selected code snippet (optional)
 * @param {string} [params.userName] - User name
 * @returns {AsyncGenerator<string>} Streaming text chunks
 */
export async function* createAiStream({
  roomId,
  mode,
  message,
  code,
  language,
  selection,
  userName,
}) {
  // Validate mode
  if (!MODE_INSTRUCTIONS[mode]) {
    throw new Error(
      `Invalid AI mode: "${mode}". Valid modes: ${Object.keys(MODE_INSTRUCTIONS).join(", ")}`
    );
  }

  // Rate limit check
  assertWithinRateLimit(roomId);

  const cleanMessage = message.trim();
  if (!cleanMessage) {
    throw new Error("Message is required.");
  }

  const selectedCode = selection?.trim()
    ? `Selected code:\n\`\`\`${language}\n${selection.trim()}\n\`\`\``
    : "No explicit editor selection was provided.";

  const systemPrompt = [
    "You are CodeCollab AI, an assistant embedded in a real-time collaborative code editor.",
    "Use the provided code context as your source of truth. If the provided context is insufficient, say what is missing.",
    "Keep suggestions practical for the currently selected language and avoid inventing files or APIs that are not in context.",
    "When you include code, use fenced code blocks and keep changes focused.",
    `Current mode: ${mode.toUpperCase()}`,
    MODE_INSTRUCTIONS[mode],
  ].join("\n");

  const userPrompt = clampText(
    [
      `Room language: ${language}`,
      `User: ${userName?.trim() || "Guest"}`,
      `Mode: ${mode}`,
      selectedCode,
      `User request:\n${cleanMessage}`,
      `Full editor code:\n\`\`\`${language}\n${code || "// Empty editor"}\n\`\`\``,
    ].join("\n\n"),
    AI_MAX_INPUT_CHARS
  );

  // Stream from the AI provider
  yield* aiProvider.streamResponse({ systemPrompt, userPrompt });
}

/**
 * Returns AI provider info for health checks
 */
export function getAiStatus() {
  return {
    provider: aiProvider.providerName,
    model: aiProvider.model,
    isConfigured: aiProvider.isConfigured,
  };
}
