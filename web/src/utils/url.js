// Application URLs are set by organisation owners, so they must never be used
// as a navigation target or href unless they are plain http(s) URLs: a
// javascript: URL would run as script on the login origin.
export function safeAppUrl(url) {
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:' ? url : undefined;
  } catch (e) {
    return undefined;
  }
}
