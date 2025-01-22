import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import pagedPdf from "./paged";

// https://astro.build/config
export default defineConfig({
  integrations: [
    pagedPdf({ "/index.html": true }),
    tailwind({ applyBaseStyles: false }),
  ],
});
