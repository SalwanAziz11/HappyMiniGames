import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const storedTheme = (localStorage.getItem("happy-mini-arcade-theme") as "light" | "dark") ?? "dark";
document.documentElement.dataset.theme = storedTheme;
document.body.dataset.theme = storedTheme;
localStorage.setItem("happy-mini-arcade-theme", storedTheme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
