const ABSOLUTE_HTTP_HREF = /^(https?:)?\/\//i

/**
 * True when `href` is an absolute http(s) URL whose origin is not the app web
 * base (`APP_URL`). Relative paths and same-origin absolute URLs stay in the
 * current tab.
 */
export function shouldOpenLinkInNewTab(href: string): boolean {
  const trimmed = href.trim()

  if (!ABSOLUTE_HTTP_HREF.test(trimmed)) {
    return false
  }

  const appBase = process.env.APP_URL

  if (!appBase) {
    return true
  }

  try {
    const link = new URL(trimmed, appBase)
    const app = new URL(appBase)

    if (link.protocol !== 'http:' && link.protocol !== 'https:') {
      return false
    }

    return link.origin !== app.origin
  } catch {
    return true
  }
}
