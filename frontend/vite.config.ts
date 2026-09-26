import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // The backend runs on a different origin; this proxy keeps the browser
    // same-origin in development, so no CORS round trips and cookies work.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Sourcemaps aid debugging but would publish the source with the bundle,
    // so they are only emitted for local development builds.
    sourcemap: mode !== 'production',
  },
}));
