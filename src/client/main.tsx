import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initTheme } from "./lib/theme";

// Restore the persisted theme before rendering to avoid a flash of default.
initTheme();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root not found");
}

createRoot(root).render(<App />);
