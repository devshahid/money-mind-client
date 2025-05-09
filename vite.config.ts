import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Get the base path depending on environment

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
});
