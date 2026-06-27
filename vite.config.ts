import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isCapacitorBuild = process.env.VITE_CAPACITOR === '1'

// https://vite.dev/config/
export default defineConfig({
  base: isCapacitorBuild ? './' : '/kids-thinking-play/',
  plugins: [react()],
})
