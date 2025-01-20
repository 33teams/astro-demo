import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { preview } from "astro";
import type { AstroIntegration } from "astro";
import pdf from "astro-pdf";
import type { PagesFunction, PagesMap } from "astro-pdf";
import type { Page } from "puppeteer";

const pagedPolyfill = join(dirname(fileURLToPath(import.meta.url)), "node_modules", "pagedjs", "dist", "paged.polyfill.min.js");

async function applyPagedJs(page: Page): Promise<void> {
  const propertyName = "__pagedjs_render_complete__" as const;
  logEvents(page);
  await page.evaluate(
    ({ propertyName }) => {
      window[propertyName] = false;
      window.PagedConfig = {
        after() {
          console.debug("render complete");
          window[propertyName] = true;
        },
        auto: true,
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
    async server(config) {
      const previewServer = await preview({ logLevel: "debug", root: fileURLToPath(config.root) });
      return {
        close: () => previewServer.stop(),
        url: new URL(`http://${previewServer.host ?? "localhost"}:${previewServer.port}`),
      };
    },
  });
}

function logEvents(page: Page): void {
  page.on("console", (message) => {
    const type = message.type();
    const text = message.text();
    const args: string[] = text === "JSHandle@error"
      ? message.args().map((arg) => arg.remoteObject().description ?? "<no description>")
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
