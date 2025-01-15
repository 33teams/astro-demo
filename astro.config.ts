// @ts-check
import { defineConfig } from "astro/config";
import { Page } from "puppeteer";
import pdf from "astro-pdf";

async function applyPagedJs(page: Page): Promise<void> {
  page.on("console", (message) => {
    console.log("[BROWSER] %s", message.text());
  });
  const propertyName = "__pagedjs_render_complete__" as const;
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
  ],
});
