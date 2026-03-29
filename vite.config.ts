import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    /** Keep all @deck.gl packages out of the pre-bundle so they share one @luma.gl (avoids “luma.gl has already been initialized”). */
    exclude: [
      "@deck.gl/core",
      "@deck.gl/geo-layers",
      "@deck.gl/layers",
      "@deck.gl/mapbox",
      "@duckdb/duckdb-wasm",
    ],
    include: [
      "@loaders.gl/core",
      "@loaders.gl/loader-utils",
      "@loaders.gl/worker-utils",
      "@loaders.gl/schema",
      "@loaders.gl/zip",
      "@loaders.gl/gis",
      "@loaders.gl/mvt",
      "@loaders.gl/tiles",
      "earcut",
      "fast-xml-parser",
      "long",
      "jszip",
      "pako",
      "snappyjs",
    ],
    needsInterop: ["earcut", "fast-xml-parser", "long", "jszip", "pako", "snappyjs"],
  },
  assetsInclude: ['**/*.wasm'],
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
    dedupe: [
      "@deck.gl/core",
      "@deck.gl/layers",
      "@deck.gl/geo-layers",
      "@deck.gl/mapbox",
      "@luma.gl/core",
      "@luma.gl/engine",
      "@luma.gl/webgl",
      "@luma.gl/constants",
      "@luma.gl/shadertools",
    ],
  },
}));
