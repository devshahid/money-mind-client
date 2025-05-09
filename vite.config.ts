import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Get the base path depending on environment
const isProduction = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: isProduction ? "/money-mind-client" : "/",
});
