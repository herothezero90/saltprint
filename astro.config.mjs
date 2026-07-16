import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: isGitHubPages ? 'https://herothezero90.github.io' : process.env.URL,
  base: isGitHubPages ? '/saltprint' : undefined,
  vite: {
    plugins: [tailwindcss()],
  },
});
