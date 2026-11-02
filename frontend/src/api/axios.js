import axios from "axios";

// Keep VITE_API_URL configurable in Vercel; use the Render service as a safe
// production fallback so the frontend never silently targets localhost.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://codecollab-backend-n0jf.onrender.com"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
