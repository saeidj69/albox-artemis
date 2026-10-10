import { describe, expect, it } from 'vitest'

import { serializePayload } from './serialize-payload'

describe('serializePayload', () => {
  it('returns undefined for empty payloads', () => {
    expect(serializePayload(undefined)).toBeUndefined()
    expect(serializePayload(null)).toBeUndefined()
    expect(serializePayload('')).toBeUndefined()
  })

  it('parses JSON strings and keeps every field as-is', () => {
    expect(
      serializePayload('{"title":"home","otp":"1234","postal_code":"123"}'),
    ).toBe('{"title":"home","otp":"1234","postal_code":"123"}')
  })

  it('describes non-plain payloads instead of reading them', () => {
    expect(serializePayload(new FormData())).toBe('[FormData]')
  })

  it('caps long strings and the serialized size', () => {
    const long = serializePayload({ note: 'a'.repeat(900) }) as string

    expect(long).toContain('…')
    expect(long.length).toBeLessThan(600)

    const many = serializePayload(
      Object.fromEntries(
        Array.from({ length: 200 }, (_, i) => [`key${i}`, 'v'.repeat(50)]),
      ),
    ) as string

    expect(many.length).toBeLessThanOrEqual(2001)
  })

  it('truncates deep nesting and long arrays', () => {
    const deep = { a: { b: { c: { d: { e: { f: 1 } } } } } }

    expect(serializePayload(deep)).toContain('[Truncated]')
    expect(
      JSON.parse(serializePayload(Array(50).fill(1)) as string),
    ).toHaveLength(20)
  })

  it('keeps non-JSON strings as-is', () => {
    expect(serializePayload('<html>bad gateway</html>')).toBe(
      '"<html>bad gateway</html>"',
    )
  })
})
