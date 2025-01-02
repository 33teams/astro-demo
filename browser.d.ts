interface Console {
  // allow arbitrary console methods
  [key: string]: typeof Console["log"];
}

interface Window {
  __pagedjs_render_complete__?: boolean;
  PagedConfig?: {
    after?: () => void | Promise<void>;
    auto?: boolean;
    before?: () => void | Promise<void>;
  };
}
