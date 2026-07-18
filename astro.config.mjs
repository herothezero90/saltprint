import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.URL;

export default defineConfig({
  site,
  integrations: site
    ? [sitemap({filter: (page) => !page.endsWith('/paper-tile-variants/')})]
    : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
