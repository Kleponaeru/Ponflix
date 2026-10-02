import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const sourceDirectory = fileURLToPath(new URL("./src", import.meta.url));
const animeApiProxy = {
  target: "https://ponflix-api.vercel.app",
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/ponflix-anime-api/, ""),
};
const movieApiProxy = {
  target: "https://ponflix-api.vercel.app",
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/ponflix-movie-api/, ""),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": sourceDirectory,
    },
  },
  server: {
    proxy: {
      "/ponflix-anime-api": animeApiProxy,
      "/ponflix-movie-api": movieApiProxy,
    },
  },
  preview: {
    proxy: {
      "/ponflix-anime-api": animeApiProxy,
      "/ponflix-movie-api": movieApiProxy,
    },
  },
});
