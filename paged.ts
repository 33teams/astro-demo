import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";
import pdf from "astro-pdf";
import type { PagesFunction, PagesMap } from "astro-pdf";
import type { Page } from "puppeteer";

const pagedPolyfill = join(dirname(fileURLToPath(import.meta.url)), "node_modules", "pagedjs", "dist", "paged.polyfill.min.js");

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
  await page.addScriptTag({ path: pagedPolyfill });
  await page.waitForFunction(
    ({ propertyName }) => window[propertyName] === true,
    { polling: 500 },
    { propertyName },
  );
}

export default function pagedPdf(pages: PagesFunction | PagesMap): AstroIntegration {
  return pdf({
    baseOptions: {
      callback: applyPagedJs,
      pdf: {
        displayHeaderFooter: false,
        margin: undefined,
        printBackground: true,
      },
    },
    launch: { dumpio: true },
    pages,
  });
}
