import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // Root-relative paths; change to '/your-subdomain/' if needed (e.g., '/hypsosis/')
  build: {
    chunkSizeWarningLimit: 600,  // Handles larger Three.js asset bundles
    assetsDir: 'assets',  // Ensures HDR/EXR/JSON go to dist/assets/ for easy relative linking
    rollupOptions: {
      output: {
        manualChunks: undefined  // Optional: Avoids extra chunking that can break asset paths
      }
    }
  }
  // No assetsInclude needed—use public/ folder or ?url imports in script.js for EXR/HDR/JSON
});