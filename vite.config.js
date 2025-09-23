import { defineConfig } from 'vite';

export default defineConfig({
  base: '/threejs-project_website1/',
  assetsInclude: ['**/*.exr', '**/*.json'],
  build: {
    chunkSizeWarningLimit: 600 // kB
  }
});