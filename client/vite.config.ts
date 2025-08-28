import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// Front-end port
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), "");
  const port = env.VITE_PORT ? parseInt(env.VITE_PORT) : 5173
  return {
    plugins: [react()],
    server: {
      port: port,
    },
  };
});
