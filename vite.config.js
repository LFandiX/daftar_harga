import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// base './' = jalan di GitHub Pages dengan nama repo apa pun
export default defineConfig({ base: './', plugins: [vue()] })
