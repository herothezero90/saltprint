import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.URL,
  vite: {
    plugins: [tailwindcss()],
  },
});
