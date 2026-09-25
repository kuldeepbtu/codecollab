/**
 * AI Provider — Gemini / OpenAI / Disabled fallback
 * Ported from Project 1 TypeScript to MERN JavaScript
 */

import {
  AI_PROVIDER,
  GEMINI_API_KEY,
  GEMINI_MODEL,
  OPENAI_API_KEY,
  OPENAI_MODEL,
} from "../config/env.js";

// ─── Mode-specific system instructions ────────────────────────────
export const MODE_INSTRUCTIONS = {
  ask: "Answer the user's coding question directly and ground your answer in the provided room context.",
  explain:
    "Explain the selected or relevant code clearly. Prefer concise teaching language and mention important control flow.",
  debug:
    "Find likely bugs, edge cases, and failure modes. Suggest concrete fixes.",
  review:
    "Review the code for correctness, maintainability, security, and missing tests. Lead with findings.",
  tests:
    "Suggest useful tests and include example test code when practical.",
  refactor:
    "Suggest a focused refactor and include replacement code only when it is clearly helpful.",
};

// ─── Disabled fallback (no API key configured) ────────────────────
class DisabledProvider {
  providerName = "disabled";
  model = "none";
  isConfigured = false;

  async *streamResponse() {
    yield "⚠️ AI is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY to the backend .env file to enable AI-powered code assistance.";
  }
}

// ─── Gemini Provider ──────────────────────────────────────────────
class GeminiProvider {
  providerName = "gemini";
  isConfigured = true;

  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async *streamResponse({ systemPrompt, userPrompt }) {
    // Use Gemini REST API with streaming (SSE)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    // Parse SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const text =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) yield text;
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  }
}

// ─── OpenAI Provider ──────────────────────────────────────────────
class OpenAIProvider {
  providerName = "openai";
  isConfigured = true;

  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async *streamResponse({ systemPrompt, userPrompt }) {
    const url = "https://api.openai.com/v1/chat/completions";

    const body = {
      model: this.model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
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

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed?.choices?.[0]?.delta?.content || "";
            if (delta) yield delta;
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────
export function createAiProvider() {
  if (AI_PROVIDER === "gemini" && GEMINI_API_KEY) {
    console.log(`✅ AI Provider: Gemini (${GEMINI_MODEL})`);
    return new GeminiProvider(GEMINI_API_KEY, GEMINI_MODEL);
  }

  if (AI_PROVIDER === "openai" && OPENAI_API_KEY) {
    console.log(`✅ AI Provider: OpenAI (${OPENAI_MODEL})`);
    return new OpenAIProvider(OPENAI_API_KEY, OPENAI_MODEL);
  }

  // Try the other provider as fallback
  if (GEMINI_API_KEY) {
    console.log(`✅ AI Provider: Gemini fallback (${GEMINI_MODEL})`);
    return new GeminiProvider(GEMINI_API_KEY, GEMINI_MODEL);
  }

  if (OPENAI_API_KEY) {
    console.log(`✅ AI Provider: OpenAI fallback (${OPENAI_MODEL})`);
    return new OpenAIProvider(OPENAI_API_KEY, OPENAI_MODEL);
  }

  console.log("⚠️  AI Provider: Disabled (no API keys configured)");
  return new DisabledProvider();
}
