import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // For GitHub Pages root domain (username.github.io)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        lecturathon: './lecturathon.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
