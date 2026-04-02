import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('react-toastify')) {
            return 'toast';
          }

          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'icons';
          }

          if (id.includes('axios') || id.includes('socket.io-client')) {
            return 'utils';
          }

          if (
            id.includes('react-router-dom') ||
            id.includes('react-dom') ||
            /[\\/]react[\\/]/.test(id)
          ) {
            return 'vendor';
          }
        },
      },
    },
  },
});
