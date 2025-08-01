import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/", // Keep '/' if deploying to root domain
  plugins: [
    react(),
    tailwindcss(),
  ],
})
