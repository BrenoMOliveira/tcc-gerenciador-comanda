import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: true,       // no Windows é mais tranquilo que "::"
    port: 8080,
  },
  plugins: [
    react(),
    // exemplo de plugin condicional:
    // ...(mode === "development" ? [algumPluginDev()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));

