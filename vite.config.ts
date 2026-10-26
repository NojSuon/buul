import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the build works at any address (e.g. nojsuon.github.io/buul/).
  base: './',
  plugins: [react()],
});
