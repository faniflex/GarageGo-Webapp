import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTheme } from "./lib/theme";

// Apply theme before React mounts to reduce flash
if (typeof window !== "undefined") {
	initTheme();
}

createRoot(document.getElementById("root")!).render(<App />);
