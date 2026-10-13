import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the built page also works when opened straight from disk.
  base: './',
  plugins: [react()],
  server: {
    host: true,
  },
});
