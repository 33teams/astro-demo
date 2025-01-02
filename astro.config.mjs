// @ts-check
import { defineConfig } from 'astro/config';

import pdf from 'astro-pdf';

// https://astro.build/config
export default defineConfig({
  integrations: [
    pdf({
      launch: { dumpio: true },
      pages: { "/index.html": true },
    }),
  ]
});
