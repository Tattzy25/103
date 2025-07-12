import { defineConfig, Plugin, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import app from "./server";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 8080,
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
    build: {
      outDir: 'dist/client',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
    define: {
      "process.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL),
      "process.env.ABLY_API_KEY": JSON.stringify(env.ABLY_API_KEY),
    },
  };
});
