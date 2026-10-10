type Rgb = { r: number; g: number; b: number }

type ParsedColor = { rgb: Rgb; alpha: number }

export type ReadableTextColor = 'white' | 'black'

/**
 * Color tokens the page-builder color picker can emit: hex (#rgb/#rgba/
 * #rrggbb/#rrggbbaa swatches and gradient defaults) and rgb()/rgba()
 * (Mantine picker with format="rgba"). Matched anywhere in the value so
 * gradient stops are found too. Longest hex alternative first so #rrggbb
 * isn't consumed as #rgb.
 */
const HEX_COLOR_RE = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi
const RGB_COLOR_RE =
  /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/gi

const clampChannel = (value: number): number =>
  Math.min(255, Math.max(0, value))

const clampAlpha = (value: number): number => Math.min(1, Math.max(0, value))

const parseHexColor = (hex: string): ParsedColor | null => {
  const body = hex.slice(1)
  const full =
    body.length <= 4
      ? body
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : body
  const int = Number.parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(int)) {
    return null
  }
  const alpha =
    full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1
  return {
    rgb: { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 },
    alpha: clampAlpha(alpha),
  }
}

const collectColors = (value: string): ParsedColor[] => {
  const colors: ParsedColor[] = []

  for (const match of value.matchAll(HEX_COLOR_RE)) {
    const parsed = parseHexColor(match[0])
    if (parsed) {
      colors.push(parsed)
    }
  }

  for (const match of value.matchAll(RGB_COLOR_RE)) {
    const [, r, g, b, a] = match
    colors.push({
      rgb: {
        r: clampChannel(Number(r)),
        g: clampChannel(Number(g)),
        b: clampChannel(Number(b)),
      },
      alpha: a == null ? 1 : clampAlpha(Number(a)),
    })
  }

  return colors
}

/** Semi-transparent colors are seen over the app's light page background. */
const compositeOverWhite = ({ rgb, alpha }: ParsedColor): Rgb => ({
  r: rgb.r * alpha + 255 * (1 - alpha),
  g: rgb.g * alpha + 255 * (1 - alpha),
  b: rgb.b * alpha + 255 * (1 - alpha),
})

const linearizeChannel = (channel: number): number => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** WCAG 2.x relative luminance of an opaque sRGB color, in [0, 1]. */
const relativeLuminance = (rgb: Rgb): number =>
  0.2126 * linearizeChannel(rgb.r) +
  0.7152 * linearizeChannel(rgb.g) +
  0.0722 * linearizeChannel(rgb.b)

/**
 * Below this luminance, white text has the higher WCAG contrast ratio than
 * black text (crossover of (1.05)/(L+0.05) and (L+0.05)/0.05).
 */
const WHITE_TEXT_LUMINANCE_THRESHOLD = 0.179

/**
 * Picks the readable text color (white or black) over a CSS background value —
 * a solid color or a linear-gradient (stops are averaged). Returns null when
 * no color token can be parsed, so callers choose their own fallback.
 */
export const readableTextColorOn = (
  background: string | null | undefined,
): ReadableTextColor | null => {
  if (!background) {
    return null
  }

  const colors = collectColors(background)
  if (colors.length === 0) {
    return null
  }

  const averageLuminance =
    colors.reduce(
      (sum, color) => sum + relativeLuminance(compositeOverWhite(color)),
      0,
    ) / colors.length

  return averageLuminance <= WHITE_TEXT_LUMINANCE_THRESHOLD ? 'white' : 'black'
}

/** Tailwind class for a readable text color; undefined passes through. */
export const readableTextClass = (
  color: ReadableTextColor | null | undefined,
): string | undefined =>
  color ? (color === 'black' ? 'text-black' : 'text-white') : undefined
