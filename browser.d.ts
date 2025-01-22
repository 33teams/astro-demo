interface Settings {
  hyphenGlyph?: string;
  maxChars?: number;
}

namespace Paged {
  interface Chunker {}
  interface Sheet {}
}

type CssNode = import("css-tree").CssNode;

interface Handler {
  // region: Previewer
  beforePreview(content: DocumentFragment, renderTo: Node);
  afterPreview(pages: Node[]);
  // endregion
  // region: Chunker
  beforeParsed(content: DocumentFragment);
  afterParsed(parsed: DocumentFragment);
  beforePageLayout(page: Node);
  afterPageLayout(pageElement: Element, page: Node, breakToken: string | undefined);
  afterRendered(pages: Node[]);
  // endregion
  // region: Polisher
  beforeTreeParse(text: string, sheet: CssNode);
  beforeTreeWalk(ast: CssNode);
  afterTreeWalk(ast: CssNode, sheet: Paged.Sheet);
  // endregion
}

interface HandlerClass {
  new(chunker, polisher, caller): Handler;
}

interface PagedConfiguration {
  after?: (done?: Paged.Chunker) => void | Promise<void>;
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
  __pagedjs_render_complete__?: boolean | null;
  PagedConfig?: Partial<PagedConfiguration>;
  PagedPolyfill: EventEmitter & Previewer;
  Paged: {
    Handler: HandlerClass;
    Previewer: new(options?: Settings) => Previewer;
    registerHandlers(...handlers: HandlerClass[]): void;
  };
}
