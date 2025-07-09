// front-end-inscricoes/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@chakra-ui/react', '@ark-ui/react', 'hoist-non-react-statics'],
  },
  server: {
    fs: {
      strict: false,
    },
  },
});