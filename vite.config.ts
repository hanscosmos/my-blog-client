import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // 设置 `@` 指向 `src` 目录
    },
  },
  server: {
    port: 8888,
    cors: true,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
