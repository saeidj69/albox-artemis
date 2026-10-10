const MAX_DEPTH = 5
const MAX_ARRAY_ITEMS = 20
const MAX_STRING_LENGTH = 500
const MAX_SERIALIZED_LENGTH = 2000

const limit = (value: unknown, depth: number): unknown => {
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…`
      : value
  }

  if (value === null || typeof value !== 'object') return value
  if (depth >= MAX_DEPTH) return '[Truncated]'

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => limit(item, depth + 1))
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, limit(item, depth + 1)]),
  )
}

const parse = (value: unknown): unknown => {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

/**
 * Turns a request/response payload into a size-capped JSON string.
 * Serialized up front because Sentry flattens nested context objects past a few levels.
 * Non-plain payloads (FormData, Blob, streams) are described, not read.
 */
export const serializePayload = (payload: unknown): string | undefined => {
  if (payload === undefined || payload === null || payload === '') {
    return undefined
  }

  if (typeof payload === 'object' && !Array.isArray(payload)) {
    const prototype = Object.getPrototypeOf(payload)

    if (prototype !== Object.prototype && prototype !== null) {
      return `[${payload.constructor?.name ?? 'object'}]`
    }
  }

  const serialized = JSON.stringify(limit(parse(payload), 0))

  return serialized.length > MAX_SERIALIZED_LENGTH
    ? `${serialized.slice(0, MAX_SERIALIZED_LENGTH)}…`
    : serialized
}
