import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Allow overriding the base path via the BASE_URL env var (useful for GitHub Pages)
  // base: process.env.BASE_URL || '/',
  base: "/Karutagx/",
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
