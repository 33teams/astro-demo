import type { AstroIntegration } from "astro";
import pdf from "astro-pdf";
import type { PagesFunction, PagesMap } from "astro-pdf";
import type { Page } from "puppeteer";

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
