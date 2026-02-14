import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        }
    },
    build: {
        target: 'es2015',
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['framer-motion', 'lucide-react', 'react-toastify', 'chart.js', 'react-chartjs-2'],
                    utils: ['axios', 'socket.io-client']
                }
            }
        }
    },
})
