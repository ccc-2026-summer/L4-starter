import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    // p5 本身約 1MB，調高門檻避免 build 時跳 chunk 過大的警告
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        sketch01: resolve(import.meta.dirname, 'sketches/01.html'),
        sketch02: resolve(import.meta.dirname, 'sketches/02.html'),
        sketch03: resolve(import.meta.dirname, 'sketches/03.html'),
        sketch04: resolve(import.meta.dirname, 'sketches/04.html'),
        sketch05: resolve(import.meta.dirname, 'sketches/05.html'),
        sketch06: resolve(import.meta.dirname, 'sketches/06.html'),
      },
    },
  },
});
