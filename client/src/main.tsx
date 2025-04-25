import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Initialize the app on load
async function initializeApp() {
  try {
    // Try to initialize demo data if first time
    await fetch('/api/init-demo');
  } catch (error) {
    console.error("Failed to initialize demo data:", error);
  }
}

initializeApp();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <App />
    </TooltipProvider>
  </QueryClientProvider>
);
