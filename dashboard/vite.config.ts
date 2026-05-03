import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // NICK-064: 5174 picked deliberately to avoid clash with the priority-forge
  // dev server on 5173 (some teammates run both locally during demo prep).
  server: { port: 5174 },
});
