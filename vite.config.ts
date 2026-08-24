import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Project-pages URL (username.github.io/fontify) needs the subpath as base.
  base: process.env.GITHUB_ACTIONS ? '/fontify/' : '/',
  server: { host: true, port: 5173, strictPort: true },
})
