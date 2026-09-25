/**
 * AI Service (Frontend) — Streams AI responses via SSE
 */

import api from "../api/axios";

const AI_MODES = [
  { id: "ask", label: "💬 Ask", description: "Ask any coding question" },
  { id: "explain", label: "📖 Explain", description: "Explain selected code" },
  { id: "debug", label: "🐛 Debug", description: "Find bugs & edge cases" },
  { id: "review", label: "🔍 Review", description: "Code review for quality" },
  { id: "tests", label: "🧪 Tests", description: "Generate test suggestions" },
  {
    id: "refactor",
    label: "♻️ Refactor",
    description: "Suggest focused refactors",
  },
];

/**
 * Get AI provider status
 */
export const getAiStatus = async () => {
  const res = await api.get("/api/ai/status");
  return res.data;
};

/**
 * Stream AI response via SSE (fetch-based, not axios)
 * @param {Object} params
 * @param {Function} onToken - Called with each text delta
 * @param {Function} onDone - Called when stream completes (full content)
 * @param {Function} onError - Called on error
 * @returns {AbortController} - Call .abort() to cancel
 */
export const streamAiResponse = ({
  roomId,
  mode,
  message,
  code,
  language,
  selection,
  userName,
  onToken,
  onDone,
  onError,
}) => {
  const controller = new AbortController();
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  fetch(`${baseUrl}/api/ai/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      roomId,
      mode,
      message,
      code,
      language,
      selection,
      userName,
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `AI request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              if (currentEvent === "token" && data.delta) {
                onToken(data.delta);
              } else if (currentEvent === "done") {
                onDone(data.content);
              } else if (currentEvent === "error") {
                onError(data.message || "Unknown AI error");
              }
            } catch {
              // skip malformed
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError(err.message || "AI request failed");
      }
    });

  return controller;
};

export { AI_MODES };
