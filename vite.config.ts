import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Separa librerías para que el navegador las cachee entre despliegues
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client'],
          prism: ['prism-react-renderer'],
        },
      },
    },
  },
});
