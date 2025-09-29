import path from "path" // <-- Add this import
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: { // <-- Add this 'resolve' object
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
