// @ts-check
import { defineConfig } from 'astro/config';

import pdf from 'astro-pdf';

/**
 * @param {import("puppeteer").Page} page
 */
async function applyPagedJs(page) {
  page.on("console", (message) => {
    console[message.type()]("[BROWSER] %s", message.text());
  });
  /** @type {"__pagedjs_render_complete__"} */
  const propertyName = "__pagedjs_render_complete__";
  await page.evaluate(
    ({ propertyName }) => {
      window[propertyName] = false;
      window.PagedConfig = {
        auto: true,
        after() {
          console.debug("render complete");
          window[propertyName] = true;
        },
      };
    },
    { propertyName },
  );
  await page.addScriptTag({
    url: "https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.min.js",
  });
  await page.waitForFunction(
    ({ propertyName }) => window[propertyName] === true,
    { polling: 500 },
    { propertyName },
  );
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    pdf({
      baseOptions: { callback: applyPagedJs },
      launch: { dumpio: true },
      pages: { "/index.html": true },
    }),
  ]
});
