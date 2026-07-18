import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const site = isGitHubPages ? 'https://herothezero90.github.io' : process.env.URL;

export default defineConfig({
  site,
  base: isGitHubPages ? '/saltprint' : undefined,
  integrations: site
    ? [sitemap({filter: (page) => !page.endsWith('/paper-tile-variants/')})]
    : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
