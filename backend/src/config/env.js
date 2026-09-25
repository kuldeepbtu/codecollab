import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// AI Configuration
export const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // "gemini" | "openai"
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const AI_MAX_INPUT_CHARS = parseInt(process.env.AI_MAX_INPUT_CHARS || "12000", 10);
export const AI_RATE_LIMIT_PER_ROOM = parseInt(process.env.AI_RATE_LIMIT_PER_ROOM || "20", 10);
export const AI_RATE_LIMIT_WINDOW_MS = parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || "60000", 10);

// GitHub Configuration (user provides their own PAT in the frontend)
export const GITHUB_API_BASE = process.env.GITHUB_API_BASE || "https://api.github.com";