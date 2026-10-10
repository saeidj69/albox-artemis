import { afterEach, describe, expect, test, vi } from 'vitest'

import { identifyClarityUser, setClarityTag } from './index'

describe('clarity adapter', () => {
  afterEach(() => {
    delete window.clarity
  })

  test('identifyClarityUser calls clarity identify with the CUID', () => {
    const clarity = vi.fn()
    window.clarity = clarity

    identifyClarityUser('U-42')

    expect(clarity).toHaveBeenCalledWith('identify', 'U-42')
  })

  test('identifyClarityUser passes friendly name when provided', () => {
    const clarity = vi.fn()
    window.clarity = clarity

    identifyClarityUser('U-42', 'عباس مرتضوی')

    expect(clarity).toHaveBeenCalledWith(
      'identify',
      'U-42',
      undefined,
      undefined,
      'عباس مرتضوی',
    )
  })

  test('setClarityTag calls clarity set', () => {
    const clarity = vi.fn()
    window.clarity = clarity

    setClarityTag('user_type', 'buyer')

    expect(clarity).toHaveBeenCalledWith('set', 'user_type', 'buyer')
  })
})
