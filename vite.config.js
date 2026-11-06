import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// No manual chunking: three / R3F / drei are only reachable through the lazy
// HeroScene import, so they split into their own async chunk automatically.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1100,
  },
})
