import { fileURLToPath } from "node:url";

import { preview } from "astro";
import type { AstroIntegration } from "astro";
import pdf from "astro-pdf";
import type { PagesFunction, PagesMap } from "astro-pdf";
import type { Page } from "puppeteer";

async function applyPagedJs(page: Page, pagedVersion: string): Promise<void> {
  const propertyName = "__pagedjs_render_complete__" as const;
  logEvents(page);
  await page.evaluate(
    ({ propertyName }) => {
      window.PagedConfig = { auto: false };
      window[propertyName] = null;
    },
    { propertyName },
  );
  // TODO could we resolve this locally? `import.meta.resolve` isn't supported by Vite yet
  await page.addScriptTag({
    url: `https://unpkg.com/pagedjs@${pagedVersion}/dist/paged.polyfill.min.js`,
  });
  await page.evaluate(
    async ({ propertyName }) => {
      try {
        await window.PagedPolyfill.preview();
        console.info("render complete");
        window[propertyName] = true;
      } catch (err) {
        console.error(err);
        console.info("render failed");
        window[propertyName] = false;
      }
    },
    { propertyName },
  );
  await page.waitForFunction(
    ({ propertyName }) => window[propertyName] !== null,
    { polling: 500 },
    { propertyName },
  );
  const success = await page.evaluate(
    ({ propertyName }) => {
      return window[propertyName];
    },
    { propertyName },
  );
  if (!success) {
    throw new Error("PDF rendering failed");
  }
}

export default function pagedPdf(
  pages: PagesFunction | PagesMap,
  pagedVersion: string = "0.5.0-beta.2",
): AstroIntegration {
  return pdf({
    baseOptions: {
      callback: (page) => applyPagedJs(page, pagedVersion),
      pdf: {
        displayHeaderFooter: false,
        margin: undefined,
        printBackground: true,
      },
    },
    launch: { dumpio: true },
    pages,
    async server(config) {
      const previewServer = await preview({
        logLevel: "debug",
        root: fileURLToPath(config.root),
      });
      return {
        close: () => previewServer.stop(),
        url: new URL(
          `http://${previewServer.host ?? "localhost"}:${previewServer.port}`,
        ),
      };
    },
  });
}

function logEvents(page: Page): void {
  page.on("console", (message) => {
    const type = message.type();
    const text = message.text();
    const args: string[] =
      text === "JSHandle@error"
        ? message
            .args()
            .map((arg) => arg.remoteObject().description ?? "<no description>")
        : [text];
    switch (type) {
      case "error":
      case "debug":
      case "info":
      case "trace":
      case "warn":
        console[type]("[BROWSER] %s", ...args);
        break;
      default:
        console.log("[BROWSER] %s", ...args);
    }
  });
  page.on("error", (err) => console.error("[BROWSER]", err));
  page.on("pageerror", (err) => console.error("[BROWSER]", err));
}
