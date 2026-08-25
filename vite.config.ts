import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Served at the domain root via the custom domain fontify.xyz.
  base: '/',
  server: { host: true, port: 5173, strictPort: true },
})
