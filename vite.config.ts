import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5001,
    hmr: true,
    proxy: {
      '/api/opendata': {
        target: 'https://opendata.toronto.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opendata/, ''),
      },
      '/api/ckan': {
        target: 'https://ckan0.cf.opendata.inter.prod-toronto.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ckan/, ''),
      },
      '/api/gbfs': {
        target: 'https://tor.publicbikesystem.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gbfs/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
