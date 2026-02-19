import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@/styles/globals.css";
import { applyZoom } from "@/stores/app-store";

// Apply theme before render to avoid flash
const storedTheme = localStorage.getItem("mikroremote-theme");
if (storedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

// Apply stored zoom before render
const storedZoom = localStorage.getItem("mikroremote-zoom");
if (storedZoom) {
  const level = parseFloat(storedZoom);
  if (!isNaN(level)) applyZoom(level);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
