import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

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
            duration: 3000,
            style: {
              background: "white",
              color: "#222E50",
              border: "1px solid rgba(34,46,80,0.12)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 20px rgba(34,46,80,0.12)",
            },
            success: {
              iconTheme: { primary: "#FCCB06", secondary: "#222E50" },
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
