import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  resolveWidgetScallopHeader,
  sanitizeWidgetHeaderColor,
  WIDGET_HEADER_COLOR_KEY,
  WIDGET_HEADER_DEFAULT_COLOR,
  WIDGET_HEADER_KEY,
  WIDGET_HEADER_SCALLOP,
} from './widget-header'

describe('sanitizeWidgetHeaderColor', () => {
  test('returns the canonical hex for a known color', () => {
    expect(sanitizeWidgetHeaderColor('#11a64a')).toBe(
      WIDGET_HEADER_DEFAULT_COLOR,
    )
  })

  test('returns undefined for an unknown color', () => {
    expect(sanitizeWidgetHeaderColor('#ff00ff')).toBeUndefined()
  })
})

describe('resolveWidgetScallopHeader', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('returns the fill when header and color are valid', () => {
    expect(
      resolveWidgetScallopHeader({
        [WIDGET_HEADER_KEY]: WIDGET_HEADER_SCALLOP,
        [WIDGET_HEADER_COLOR_KEY]: WIDGET_HEADER_DEFAULT_COLOR,
      }),
    ).toEqual({ color: WIDGET_HEADER_DEFAULT_COLOR })
  })

  test('returns undefined when the header is off', () => {
    expect(
      resolveWidgetScallopHeader({
        [WIDGET_HEADER_COLOR_KEY]: WIDGET_HEADER_DEFAULT_COLOR,
      }),
    ).toBeUndefined()
  })

  test('returns undefined for an unknown header value', () => {
    expect(
      resolveWidgetScallopHeader({
        [WIDGET_HEADER_KEY]: 'wave',
        [WIDGET_HEADER_COLOR_KEY]: WIDGET_HEADER_DEFAULT_COLOR,
      }),
    ).toBeUndefined()
  })

  test('returns undefined when the color is not allow-listed', () => {
    expect(
      resolveWidgetScallopHeader({
        [WIDGET_HEADER_KEY]: WIDGET_HEADER_SCALLOP,
        [WIDGET_HEADER_COLOR_KEY]: '#ffffff',
      }),
    ).toBeUndefined()
  })

  test('returns undefined when presentations are flagged off', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'false')
    expect(
      resolveWidgetScallopHeader({
        [WIDGET_HEADER_KEY]: WIDGET_HEADER_SCALLOP,
        [WIDGET_HEADER_COLOR_KEY]: WIDGET_HEADER_DEFAULT_COLOR,
      }),
    ).toBeUndefined()
  })
})
