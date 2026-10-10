import { afterEach, describe, expect, test, vi } from 'vitest'

import { clearAnalyticsUser, identifyAnalyticsUser } from './identify'

const mockLoginWebEngageUser = vi.fn()
const mockLogoutWebEngageUser = vi.fn()
const mockSetWebEngageUserAttributes = vi.fn()
const mockIdentifyClarityUser = vi.fn()
const mockSetGtmUserId = vi.fn()
const mockClearGtmUserId = vi.fn()

vi.mock('./adapters/webengage', () => ({
  loginWebEngageUser: (...args: unknown[]) => mockLoginWebEngageUser(...args),
  logoutWebEngageUser: (...args: unknown[]) => mockLogoutWebEngageUser(...args),
  setWebEngageUserAttributes: (...args: unknown[]) =>
    mockSetWebEngageUserAttributes(...args),
}))

vi.mock('./adapters/clarity', () => ({
  identifyClarityUser: (...args: unknown[]) => mockIdentifyClarityUser(...args),
}))

vi.mock('./adapters/gtm', () => ({
  setGtmUserId: (...args: unknown[]) => mockSetGtmUserId(...args),
  clearGtmUserId: (...args: unknown[]) => mockClearGtmUserId(...args),
}))

describe('identifyAnalyticsUser', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('binds the user across WebEngage, Clarity, and GTM', () => {
    identifyAnalyticsUser({
      id: 'U-42',
      mobileNumber: '+989123456789',
      firstName: 'عباس',
      lastName: 'مرتضوی',
    })

    expect(mockLoginWebEngageUser).toHaveBeenCalledWith('U-42')
    expect(mockSetWebEngageUserAttributes).toHaveBeenCalledWith({
      we_phone: '+989123456789',
      we_first_name: 'عباس',
      we_last_name: 'مرتضوی',
    })
    expect(mockIdentifyClarityUser).toHaveBeenCalledWith('U-42', 'عباس مرتضوی')
    expect(mockSetGtmUserId).toHaveBeenCalledWith('U-42')
  })

  test('skips empty ids', () => {
    identifyAnalyticsUser({ id: '' })

    expect(mockLoginWebEngageUser).not.toHaveBeenCalled()
    expect(mockIdentifyClarityUser).not.toHaveBeenCalled()
    expect(mockSetGtmUserId).not.toHaveBeenCalled()
  })
})

describe('clearAnalyticsUser', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('clears WebEngage and GTM identity', () => {
    clearAnalyticsUser()

    expect(mockLogoutWebEngageUser).toHaveBeenCalledTimes(1)
    expect(mockClearGtmUserId).toHaveBeenCalledTimes(1)
  })
})
