import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

// ── One-time cleanup of any stale/legacy localStorage keys ──────────────────
// If a user had an old session from a previous version, wipe it so the
// fresh login flow isn't blocked by an expired or invalid token.
(function cleanupStaleStorage() {
  const token = localStorage.getItem("auracart_token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("auracart_token");
        localStorage.removeItem("auracart_user");
        localStorage.removeItem("auracart_auth");
      }
    } catch {
      // Malformed token — remove it
      localStorage.removeItem("auracart_token");
      localStorage.removeItem("auracart_user");
      localStorage.removeItem("auracart_auth");
    }
  }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "white",
              color: "#2c2320",
              border: "1px solid rgba(44,35,32,0.1)",
              borderRadius: "14px",
              fontSize: "14px",
              fontFamily: "Jost, system-ui, sans-serif",
              boxShadow: "0 4px 24px rgba(44,35,32,0.1)",
            },
            success: {
              iconTheme: { primary: "#c47a80", secondary: "white" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "white" },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
