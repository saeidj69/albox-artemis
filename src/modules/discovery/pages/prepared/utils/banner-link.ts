/** Style-bag key set by the admin page builder on banner widgets. */
export const BANNER_OPEN_IN_NEW_TAB_KEY = 'openInNewTab'

/** Stored when the banner link should open in a new tab. Omit the key otherwise. */
export const BANNER_OPEN_IN_NEW_TAB_VALUE = 'true'

export function isBannerOpenInNewTab(styles?: Record<string, string>): boolean {
  return styles?.[BANNER_OPEN_IN_NEW_TAB_KEY] === BANNER_OPEN_IN_NEW_TAB_VALUE
}

export function bannerLinkTargetProps(openInNewTab: boolean): {
  target?: '_blank'
  rel?: string
} {
  return openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}
