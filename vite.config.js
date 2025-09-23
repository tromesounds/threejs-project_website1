import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  assetsInclude: ['**/*.exr', '**/*.json'],
  build: {
    chunkSizeWarningLimit: 600 // kB
  }
});
