import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use base path for GitHub Pages, but root path for local dev and Netlify
  base: process.env.NODE_ENV === 'production' && !process.env.NETLIFY ? '/my_flashcards_app/' : '/',
})

