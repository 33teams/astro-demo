/**
 * Enrich browser window with PagedJS-related names
 */
interface Window {
  __pagedjs_render_complete__?: boolean;
  PagedConfig?: {
    after?: () => void | Promise<void>;
    auto?: boolean;
    before?: () => void | Promise<void>;
  };
}
