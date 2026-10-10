/**
 * Orval's generated URL builder calls value.toString() on every param,
 * converting e.g. [7] → "7" and [7,8] → "7,8" — losing array context.
 * This set lists params that must always use bracket notation (key[]=val).
 * Values may arrive as a single entry "7,8" (comma-joined) or plain "7".
 */
const ARRAY_PARAMS = new Set(['categories', 'brands', 'manufacturers'])

export function normalizeArrayParams(url: string): string {
  const questionIndex = url.indexOf('?')
  if (questionIndex === -1) return url

  const path = url.slice(0, questionIndex)
  const query = url.slice(questionIndex + 1)
  const parts: string[] = []

  for (const segment of query.split('&')) {
    const eqIndex = segment.indexOf('=')
    if (eqIndex === -1) {
      parts.push(segment)
      continue
    }

    const key = decodeURIComponent(segment.slice(0, eqIndex))
    const value = decodeURIComponent(segment.slice(eqIndex + 1))

    if (ARRAY_PARAMS.has(key)) {
      for (const item of value.split(',')) {
        const trimmed = item.trim()
        if (trimmed !== '') {
          parts.push(
            `${encodeURIComponent(key)}[]=${encodeURIComponent(trimmed)}`,
          )
        }
      }
    } else {
      parts.push(segment)
    }
  }

  return parts.length > 0 ? `${path}?${parts.join('&')}` : path
}

export function normalizeBooleanParams(url: string): string {
  const questionIndex = url.indexOf('?')
  if (questionIndex === -1) return url

  const path = url.slice(0, questionIndex)
  const query = url.slice(questionIndex + 1)
  const parts: string[] = []

  for (const segment of query.split('&')) {
    const eqIndex = segment.indexOf('=')
    if (eqIndex === -1) {
      parts.push(segment)
      continue
    }

    const rawKey = segment.slice(0, eqIndex)
    const key = decodeURIComponent(rawKey)
    const value = decodeURIComponent(segment.slice(eqIndex + 1))
    const normalizedValue =
      value === 'true' ? '1' : value === 'false' ? '0' : value

    parts.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(normalizedValue)}`,
    )
  }

  return parts.length > 0 ? `${path}?${parts.join('&')}` : path
}
