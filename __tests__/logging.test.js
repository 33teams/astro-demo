import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { launch } from "puppeteer";

describe("Puppeteer logging", () => {
  /** @type {import("puppeteer").Browser} */
  let browser;
  /** @type {import("puppeteer").Page} */
  let page;

  before(async () => {
    browser = await launch();
    page = await browser.newPage();
  });

  beforeEach(async () => {
    await page.goto("https://example.com");
  });

  after(async () => {
    await browser?.close();
  });

  it("sends client-side errors to pageerror", async () => {
    const pageerrorEvent = getEvent("pageerror");
    await page.addScriptTag({ content: "throw new Error('oh no!')" });
    const resolved = await pageerrorEvent;
    assert.equal(resolved.message, "oh no!");
  });

  it("sends client-side logs to console", async () => {
    const consoleEvent = getEvent("console");
    await page.addScriptTag({ content: "console.debug('logged')" });
    const resolved = await consoleEvent;
    assert.equal(resolved.text(), "logged");
    assert.equal(resolved.type(), "debug");
  });

  it("exposes logged error objects indirectly", async () => {
    const consoleEvent = getEvent("console");
    await page.addScriptTag({ content: "console.error(new Error('oh no!'))" });
    const resolved = await consoleEvent;
    assert.equal(resolved.text(), "JSHandle@error")
    const args = resolved.args().map((h) => h.remoteObject().description);
    assert.equal(args.length, 1);
    assert.match(args[0], /^Error: oh no!/);
  });

  /**
   * Returns a promise resolving to the event body.
   *
   * @overload
   * @param {"console"} name
   * @returns {Promise<import("puppeteer").ConsoleMessage>}
   *
   * @overload
   * @param {"pageerror"} name
   * @returns {Promise<Error>}
   *
   * @overload
   * @param {string} name
   * @returns {Promise<unknown>}
   */
  function getEvent(name) {
    return new Promise((resolve) => page.on(name, resolve));
  }
});
