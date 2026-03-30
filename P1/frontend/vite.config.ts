import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind 제거 - CSS Modules 방식으로 전환
export default defineConfig({
  plugins: [react()],
})
