/**
 * Storefront brand hexes — must match admin `BRAND_SWATCHES`.
 * Used as row-band solids and product-cart scallop fills.
 */
export const BRAND_SWATCHES = [
  '#AE8EF3',
  '#11A64A',
  '#005049',
  '#039699',
  '#915821',
  '#661516',
] as const

export const BRAND_SWATCH_DEFAULT = '#11A64A'

const COLOR_BY_LOWER: Record<string, string> = Object.fromEntries(
  BRAND_SWATCHES.map((hex) => [hex.toLowerCase(), hex]),
)

const hexToRgbKey = (hex: string): string => {
  const body = hex.startsWith('#') ? hex.slice(1) : hex
  const full =
    body.length === 3
      ? body
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : body
  const int = Number.parseInt(full, 16)
  return `${(int >> 16) & 255},${(int >> 8) & 255},${int & 255}`
}

const BRAND_RGB_KEYS = new Set(BRAND_SWATCHES.map((hex) => hexToRgbKey(hex)))

const SOLID_HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const SOLID_RGB_RE =
  /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i

export function sanitizeBrandSwatch(value?: string): string | undefined {
  if (!value) return undefined
  return COLOR_BY_LOWER[value.toLowerCase()]
}

/** True when `css` is exactly one of the six brand fills (hex or rgb/rgba). */
export function isBrandSwatchFill(css: string): boolean {
  const trimmed = css.trim()
  if (SOLID_HEX_RE.test(trimmed)) {
    return sanitizeBrandSwatch(trimmed) != null
  }
  const rgb = trimmed.match(SOLID_RGB_RE)
  if (!rgb) return false
  const key = `${Math.round(Number(rgb[1]))},${Math.round(Number(rgb[2]))},${Math.round(Number(rgb[3]))}`
  return BRAND_RGB_KEYS.has(key)
}
