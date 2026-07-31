import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;
const isTauri = process.env.TAURI_ENV_PLATFORM != null;

export default defineConfig({
  // GitHub Pages keeps the subpath; Tauri needs root-relative assets.
  base: isTauri ? '/' : '/hub-des-savoirs/',
  plugins: [react()],
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**', '**/.toolchain/**'],
    },
    // Browser CORS blocks docs.google.com/export; proxy in Vite dev only.
    proxy: {
      '/api/gdoc-export': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        rewrite: (p) => p.replace(/^\/api\/gdoc-export/, ''),
      },
    },
  },
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
