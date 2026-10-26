import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the build works at any address (e.g. nojsuon.github.io/buul/).
  base: './',
  plugins: [react()],
  define: {
    // Shown by the ?debug panel, to tell which build a device has loaded.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'),
  },
});
