import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Application installable (PWA).
// Chemin RELATIF : fonctionne que l'app soit servie à la racine ou dans un sous-dossier.
// Le service worker doit être actif pour que le navigateur propose l'installation.
if (import.meta.env.PROD && "serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* silencieux : l'app reste utilisable sans SW */
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
