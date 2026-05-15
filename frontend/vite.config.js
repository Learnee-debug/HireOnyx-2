import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react-vendor';
          if (id.includes('node_modules/@supabase')) return 'supabase';
          if (id.includes('node_modules/lucide') || id.includes('node_modules/react-hot-toast')) return 'ui';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
