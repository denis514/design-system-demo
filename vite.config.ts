import { defineConfig } from 'vite';

export default defineConfig({
  // The demo is served from a project subpath on GitHub Pages.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/design-system-demo/' : '/',
  build: { outDir: 'dist' },
});
