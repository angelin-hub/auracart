// Vite env types
/// <reference types="vite/client" />

import axios from "axios";

// In production (Netlify), use the backend URL from env
// In development, use the Vite proxy (/api → localhost:5000)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request — but NOT to auth routes (login/register)
api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register");
  if (!isAuthRoute) {
    const token = localStorage.getItem("auracart_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — but skip redirect if already on auth page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      // Only clear + redirect if NOT a login/register attempt
      if (!isAuthRoute) {
        localStorage.removeItem("auracart_token");
        localStorage.removeItem("auracart_user");
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
