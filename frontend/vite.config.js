import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGhPagesBuild = process.env.GH_PAGES === "true";
const GITHUB_REPO_NAME = "saferoutewomen"; 
export default defineConfig({
  base: isGhPagesBuild ? `/${GITHUB_REPO_NAME}/` : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});