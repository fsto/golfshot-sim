import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Hosted on GitHub Pages at https://fsto.github.io/golfshot-sim/ — so production
 * assets need to resolve under the /golfshot-sim/ sub-path. Local dev keeps a
 * root base so `npm run dev` serves at http://localhost:5173/.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/golfshot-sim/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
}));
