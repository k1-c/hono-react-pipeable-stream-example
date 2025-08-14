import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import devServer from "@hono/vite-dev-server";
import nodeAdapter from "@hono/vite-dev-server/node";
import build from "@hono/vite-build/node";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    // Client build configuration
    return {
      plugins: [react()],
      build: {
        rollupOptions: {
          input: "./src/client.tsx",
          output: {
            entryFileNames: "static/client.js",
            chunkFileNames: "static/assets/[name]-[hash].js",
            assetFileNames: "static/assets/[name].[ext]",
          },
        },
        outDir: "dist",
        emptyOutDir: false,
        copyPublicDir: false,
      },
    };
  } else {
    // Server build configuration (SSR)
    return {
      build: {
        target: "esnext",
      },
      ssr: {
        external: ["react", "react-dom"],
      },
      plugins: [
        build({
          entry: "src/index.tsx",
          outputDir: "dist",
          emptyOutDir: false,
        }),
        devServer({
          adapter: nodeAdapter,
          entry: "src/index.tsx",
          exclude: [
            /.*\.tsx?($|\?)/,
            /.*\.jsx?($|\?)/,
            /^\/@.+$/,
            /^\/favicon\.ico$/,
            /^\/static\/.+/,
            /^\/node_modules\/.*/,
          ],
        }),
      ],
    };
  }
});

