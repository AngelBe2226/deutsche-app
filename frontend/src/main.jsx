import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ProgressProvider } from "./progress.jsx";
import "./styles/tokens.css";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </React.StrictMode>
);

// Service worker solo en el build estático (PWA/GitHub Pages). En el modo
// backend no se registra, para no cachear respuestas de /api que cambian
// con cada sync.
if (import.meta.env.VITE_STATIC === "1" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {});
  });
}

