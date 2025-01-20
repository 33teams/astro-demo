interface Settings {
  hyphenGlyph?: string;
  maxChars?: number;
}

interface Chunker {}

interface Handler {
  // region: Previewer
  beforePreview(content: DocumentFragment, renderTo: Node);
  afterPreview(pages: Node[]);
  // endregion
  // region: Chunker
  beforeParsed(content: DocumentFragment);
  afterParsed(parsed: DocumentFragment);
  beforePageLayout(page: Node);
  afterPageLayout(pageElement: Element, page: Node, breakToken: string);
  afterRendered(pages: Node[]);
  // endregion
}

interface HandlerClass {
  new(chunker, polisher, caller): Handler;
}

interface PagedConfiguration {
  after?: (done?: Chunker) => void | Promise<void>;
  auto?: boolean;
  before?: () => void | Promise<void>;
  content?: DocumentFragment;
  stylesheets?: (string | Record<string, string>)[];
  renderTo?: Node;
  settings?: Settings;
}

interface Previewer {
  preview(): Promise<Chunker>;
}

/**
 * Enrich browser window with PagedJS-related names
 */
interface Window {
  __pagedjs_render_complete__?: boolean;
  PagedConfig?: Partial<PagedConfiguration>;
  Paged: {
    Handler: HandlerClass;
    Previewer: new(options?: Settings) => Previewer;
    registerHandlers(...handlers: HandlerClass[]): void;
  };
}
