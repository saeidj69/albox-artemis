import { describe, expect, test } from 'vitest'

import {
  BANNER_OPEN_IN_NEW_TAB_KEY,
  BANNER_OPEN_IN_NEW_TAB_VALUE,
  bannerLinkTargetProps,
  isBannerOpenInNewTab,
} from './banner-link'

describe('isBannerOpenInNewTab', () => {
  test('detects the stored flag', () => {
    expect(
      isBannerOpenInNewTab({
        [BANNER_OPEN_IN_NEW_TAB_KEY]: BANNER_OPEN_IN_NEW_TAB_VALUE,
      }),
    ).toBe(true)
  })

  test('rejects an absent or unknown value', () => {
    expect(isBannerOpenInNewTab({})).toBe(false)
    expect(isBannerOpenInNewTab(undefined)).toBe(false)
    expect(isBannerOpenInNewTab({ [BANNER_OPEN_IN_NEW_TAB_KEY]: '1' })).toBe(
      false,
    )
  })
})

describe('bannerLinkTargetProps', () => {
  test('adds a new-tab target and rel when enabled', () => {
    expect(bannerLinkTargetProps(true)).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  test('omits target attributes when disabled', () => {
    expect(bannerLinkTargetProps(false)).toEqual({})
  })
})
