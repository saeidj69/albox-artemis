import { isPageBuilderPresentationsEnabled } from '@/constants/feature-flags'

import {
  BRAND_SWATCH_DEFAULT,
  BRAND_SWATCHES,
  sanitizeBrandSwatch,
} from './brand-swatches'

/** Style-bag keys set by the admin page builder on product-cart widgets. */
export const WIDGET_HEADER_KEY = 'header'
export const WIDGET_HEADER_COLOR_KEY = 'headerColor'

/** Preset id for the scalloped product-cart title band. */
export const WIDGET_HEADER_SCALLOP = 'scallop'

/** Public mask asset painted with an allow-listed brand fill. */
export const WIDGET_HEADER_SVG_PATH = '/images/home/widget-header-scallop.svg'

export const WIDGET_HEADER_COLORS = BRAND_SWATCHES

export const WIDGET_HEADER_DEFAULT_COLOR = BRAND_SWATCH_DEFAULT

export function sanitizeWidgetHeaderColor(value?: string): string | undefined {
  return sanitizeBrandSwatch(value)
}

export function resolveWidgetScallopHeader(
  styles?: Record<string, string>,
): { color: string } | undefined {
  if (!isPageBuilderPresentationsEnabled()) {
    return undefined
  }
  if (styles?.[WIDGET_HEADER_KEY] !== WIDGET_HEADER_SCALLOP) {
    return undefined
  }
  const color = sanitizeWidgetHeaderColor(styles[WIDGET_HEADER_COLOR_KEY])
  if (!color) return undefined
  return { color }
}
