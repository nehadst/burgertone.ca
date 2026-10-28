import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isPreview }) => ({
  plugins: [react()],
  // Dev serves index.html for every path (the app picks the page from the URL); the built site has one HTML
  // file per page, so preview serves those files instead of falling back to the home page.
  appType: isPreview ? 'mpa' : 'spa',
  // Bundle gsap into the build-time SSR renderer (its ESM files are not Node-importable as-is).
  ssr: { noExternal: ['gsap'] },
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' },
}))
