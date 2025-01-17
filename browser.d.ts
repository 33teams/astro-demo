interface PagedConfiguration {
  after?: (done?: unknown /** Pagedjs Chunker instance */) => void | Promise<void>;
  auto?: boolean;
  before?: () => void | Promise<void>;
  content?: DocumentFragment;
  stylesheets?: (string | Record<string, string>)[];
  renderTo?: Node;
  settings?: {
    hyphenGlyph?: string;
    maxChars?: number;
  };
}

/**
 * Enrich browser window with PagedJS-related names
 */
interface Window {
  __pagedjs_render_complete__?: boolean;
  PagedConfig?: Partial<PagedConfiguration>;
}
