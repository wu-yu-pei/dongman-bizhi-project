import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue"],
          element: ["element-plus", "@element-plus/icons-vue"],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
