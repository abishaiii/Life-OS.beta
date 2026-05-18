import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This forces Vite to treat your main root folder as the code path
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
  }
})
