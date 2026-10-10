import type { CSSProperties } from 'react'

import { isPageBuilderPresentationsEnabled } from '@/constants/feature-flags'

import { readableTextColorOn, type ReadableTextColor } from '@/lib/utils'

import { isBrandSwatchFill } from './brand-swatches'

/** Style-bag key set by the admin page builder. */
export const ROW_BACKGROUND_PRESET_KEY = 'backgroundPreset'

/** Preset id for the legacy product-slider SVG band background. */
export const PRODUCT_SLIDER_BG_PRESET = 'product_slider_bg'

const PRESET_BAND_BASE: CSSProperties = {
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center top',
}

const bandStyle = (path: string): CSSProperties => ({
  backgroundImage: `url('${path}')`,
  ...PRESET_BAND_BASE,
})

/** Storefront SVG bands keyed by the admin `backgroundPreset` id. */
export const ROW_BACKGROUND_PRESETS = {
  [PRODUCT_SLIDER_BG_PRESET]: '/images/home/product-slider-bg.svg',
  product_slider_bg_cyan: '/images/home/product-slider-bg-cyan.svg',
  product_slider_bg_orange: '/images/home/product-slider-bg-orange.svg',
  product_slider_bg_green: '/images/home/product-slider-bg-green.svg',
  product_slider_bg_purple: '/images/home/product-slider-bg-purple.svg',
  product_slider_bg_red: '/images/home/product-slider-bg-red.svg',
} as const

export type RowBackgroundPresetId = keyof typeof ROW_BACKGROUND_PRESETS

const PRESET_BAND_STYLES: Record<string, CSSProperties> = Object.fromEntries(
  Object.entries(ROW_BACKGROUND_PRESETS).map(([id, path]) => [
    id,
    bandStyle(path),
  ]),
)

const isRenderableRowBackgroundPreset = (preset: string): boolean => {
  if (!(preset in PRESET_BAND_STYLES)) return false
  if (preset === PRODUCT_SLIDER_BG_PRESET) return true
  return isPageBuilderPresentationsEnabled()
}

export function resolveRowBandBackground(
  bag: Record<string, string>,
): CSSProperties | undefined {
  const preset = bag[ROW_BACKGROUND_PRESET_KEY]
  if (preset && isRenderableRowBackgroundPreset(preset)) {
    return PRESET_BAND_STYLES[preset]
  }
  if (bag.background) {
    return { background: bag.background }
  }
  return undefined
}

export function hasRowBandBackground(bag: Record<string, string>): boolean {
  return resolveRowBandBackground(bag) != null
}

/**
 * Title/CTA color over a painted row. SVG presets and the six brand swatches
 * always use white (Figma contrast text) — WCAG luminance would pick black on
 * saturated greens/purples and that ink is unreadable. Arbitrary picker
 * colors still go through `readableTextColorOn`.
 */
export function resolveRowBandTextColor(
  bag: Record<string, string>,
): ReadableTextColor | undefined {
  if (!hasRowBandBackground(bag)) {
    return undefined
  }

  const preset = bag[ROW_BACKGROUND_PRESET_KEY]
  if (preset && isRenderableRowBackgroundPreset(preset)) {
    return 'white'
  }

  const background = bag.background
  if (!background) {
    return undefined
  }
  if (isBrandSwatchFill(background)) {
    return 'white'
  }
  return readableTextColorOn(background) ?? 'white'
}
