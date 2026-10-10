import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  PRODUCT_SLIDER_BG_PRESET,
  resolveRowBandBackground,
  resolveRowBandTextColor,
  ROW_BACKGROUND_PRESET_KEY,
  ROW_BACKGROUND_PRESETS,
} from './row-background-presets'

const BAND_BASE = {
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center top',
} as const

describe('resolveRowBandBackground', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('returns the SVG band style for every known preset id', () => {
    for (const [id, path] of Object.entries(ROW_BACKGROUND_PRESETS)) {
      expect(
        resolveRowBandBackground({ [ROW_BACKGROUND_PRESET_KEY]: id }),
      ).toEqual({
        backgroundImage: `url('${path}')`,
        ...BAND_BASE,
      })
    }
  })

  test('prefers a known preset over a solid background color', () => {
    expect(
      resolveRowBandBackground({
        [ROW_BACKGROUND_PRESET_KEY]: PRODUCT_SLIDER_BG_PRESET,
        background: '#fff',
      }),
    ).toEqual({
      backgroundImage: `url('${ROW_BACKGROUND_PRESETS[PRODUCT_SLIDER_BG_PRESET]}')`,
      ...BAND_BASE,
    })
  })

  test('falls back to a solid background when the preset id is unknown', () => {
    expect(
      resolveRowBandBackground({
        [ROW_BACKGROUND_PRESET_KEY]: 'not_a_preset',
        background: '#123456',
      }),
    ).toEqual({ background: '#123456' })
  })

  test('returns undefined for an unknown preset with no background', () => {
    expect(
      resolveRowBandBackground({
        [ROW_BACKGROUND_PRESET_KEY]: 'not_a_preset',
      }),
    ).toBeUndefined()
  })

  test('ignores extra slider presets when presentations are flagged off', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'false')

    expect(
      resolveRowBandBackground({
        [ROW_BACKGROUND_PRESET_KEY]: 'product_slider_bg_cyan',
      }),
    ).toBeUndefined()
    expect(
      resolveRowBandBackground({
        [ROW_BACKGROUND_PRESET_KEY]: PRODUCT_SLIDER_BG_PRESET,
      }),
    ).toEqual({
      backgroundImage: `url('${ROW_BACKGROUND_PRESETS[PRODUCT_SLIDER_BG_PRESET]}')`,
      ...BAND_BASE,
    })
  })
})

describe('resolveRowBandTextColor', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('uses white over every SVG preset', () => {
    for (const id of Object.keys(ROW_BACKGROUND_PRESETS)) {
      expect(resolveRowBandTextColor({ [ROW_BACKGROUND_PRESET_KEY]: id })).toBe(
        'white',
      )
    }
  })

  test('uses white over brand swatch fills even when luminance would pick black', () => {
    expect(resolveRowBandTextColor({ background: '#11A64A' })).toBe('white')
    expect(resolveRowBandTextColor({ background: '#AE8EF3' })).toBe('white')
    expect(
      resolveRowBandTextColor({ background: 'rgba(17, 166, 74, 1)' }),
    ).toBe('white')
  })

  test('keeps black over a light custom background', () => {
    expect(resolveRowBandTextColor({ background: '#ffffff' })).toBe('black')
  })

  test('returns undefined when the row has no painted band', () => {
    expect(resolveRowBandTextColor({})).toBeUndefined()
  })
})
