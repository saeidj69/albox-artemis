import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import useFingerprint, { parseUserAgent } from './useFingerprint'

const mockUseThumbmark = vi.fn()

vi.mock('@thumbmarkjs/react', () => ({
  useThumbmark: () => mockUseThumbmark(),
}))

const ANDROID_CHROME_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36'

const IOS_SAFARI_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

const MAC_SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'

const WINDOWS_EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'

const FIREFOX_UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0'

const OPERA_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0'

const IOS_CHROME_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.108 Mobile/15E148 Safari/604.1'

describe('parseUserAgent', () => {
  test('parses Windows + Edge', () => {
    expect(parseUserAgent(WINDOWS_EDGE_UA)).toMatchObject({
      osName: 'Windows',
      osVersion: '10.0',
      browserName: 'Edge',
      browserVersion: '126.0.0.0',
    })
  })

  test('parses macOS + Safari', () => {
    expect(parseUserAgent(MAC_SAFARI_UA)).toMatchObject({
      osName: 'macOS',
      osVersion: '14.5',
      browserName: 'Safari',
      browserVersion: '17.5',
    })
  })

  test('parses Android + Chrome', () => {
    expect(parseUserAgent(ANDROID_CHROME_UA)).toMatchObject({
      osName: 'Android',
      osVersion: '14',
      browserName: 'Chrome',
      browserVersion: '126.0.6478.122',
    })
  })

  test('parses iOS + Safari', () => {
    expect(parseUserAgent(IOS_SAFARI_UA)).toMatchObject({
      osName: 'iOS',
      osVersion: '17.5',
      browserName: 'Safari',
      browserVersion: '17.5',
    })
  })

  test('parses iOS + Chrome (CriOS)', () => {
    expect(parseUserAgent(IOS_CHROME_UA)).toMatchObject({
      osName: 'iOS',
      osVersion: '17.5',
      browserName: 'Chrome',
      browserVersion: '126.0.6478.108',
    })
  })

  test('parses Linux + Firefox', () => {
    expect(parseUserAgent(FIREFOX_UA)).toMatchObject({
      osName: 'Linux',
      osVersion: 'Unknown',
      browserName: 'Firefox',
      browserVersion: '127.0',
    })
  })

  test('parses Windows + Opera', () => {
    expect(parseUserAgent(OPERA_UA)).toMatchObject({
      osName: 'Windows',
      browserName: 'Opera',
      browserVersion: '112.0.0.0',
    })
  })

  test('returns Unknown for unrecognized user agents', () => {
    expect(parseUserAgent('curl/8.0')).toMatchObject({
      osName: 'Unknown',
      osVersion: 'Unknown',
      browserName: 'Unknown',
      browserVersion: 'Unknown',
    })
  })

  test('prefers userAgentData.platform when available', () => {
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: { platform: 'Android' },
    })

    expect(parseUserAgent(ANDROID_CHROME_UA).platform).toBe('Android')
  })
})

describe('useFingerprint hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockUseThumbmark.mockReset()

    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: ANDROID_CHROME_UA,
    })
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'fa-IR',
    })
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'Linux armv8l',
    })
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    })
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      value: 4,
    })
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: undefined,
    })

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 412,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 892,
    })
    Object.defineProperty(window.screen, 'width', {
      configurable: true,
      value: 412,
    })
    Object.defineProperty(window.screen, 'height', {
      configurable: true,
      value: 915,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('returns null fingerprint until thumbmark is ready', () => {
    mockUseThumbmark.mockReturnValue({ thumbmark: undefined })

    const { result } = renderHook(() => useFingerprint())

    expect(result.current.fingerprint).toBeNull()
  })

  test('builds UserDeviceFingerprint after thumbmark resolves', () => {
    mockUseThumbmark.mockReturnValue({ thumbmark: 'tm-abc-123' })

    const { result } = renderHook(() => useFingerprint())

    expect(result.current.fingerprint).toBeNull()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.fingerprint).toEqual({
      id: 'tm-abc-123',
      platform: 'Linux armv8l',
      osName: 'Android',
      osVersion: '14',
      browserName: 'Chrome',
      browserVersion: '126.0.6478.122',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'fa-IR',
      screenResolution: '412x915',
      viewportSize: '412x892',
      deviceMemory: 4,
      hardwareConcurrency: 8,
    })
  })

  test('falls back deviceMemory to null when unavailable', () => {
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      value: undefined,
    })
    mockUseThumbmark.mockReturnValue({ thumbmark: 'tm-no-memory' })

    const { result } = renderHook(() => useFingerprint())

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.fingerprint?.deviceMemory).toBeNull()
  })

  test('does not set fingerprint when thumbmark stays empty', () => {
    mockUseThumbmark.mockReturnValue({ thumbmark: '' })

    const { result } = renderHook(() => useFingerprint())

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.fingerprint).toBeNull()
  })
})
