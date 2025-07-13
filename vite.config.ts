import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react()
    ],
    server: {
      port: 8080,
      proxy: {
        '/api': 'http://localhost:3001',
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
      "process.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL || ""),
      "process.env.ABLY_API_KEY": JSON.stringify(env.ABLY_API_KEY || ""),
      "process.env.XI_VOICE_ADAM_MALE": JSON.stringify(env.XI_VOICE_ADAM_MALE || ""),
      "process.env.XI_VOICE_ANTONI_MALE": JSON.stringify(env.XI_VOICE_ANTONI_MALE || ""),
      "process.env.XI_VOICE_AVI_MALE_DEFAULT": JSON.stringify(env.XI_VOICE_AVI_MALE_DEFAULT || ""),
      "process.env.XI_VOICE_HOPE_FEMALE_DEFAULT": JSON.stringify(env.XI_VOICE_HOPE_FEMALE_DEFAULT || ""),
      "process.env.XI_VOICE_JESSICA_FEMALE": JSON.stringify(env.XI_VOICE_JESSICA_FEMALE || ""),
      "process.env.XI_VOICE_SARAH_FEMALE": JSON.stringify(env.XI_VOICE_SARAH_FEMALE || ""),
    },
  };
});
