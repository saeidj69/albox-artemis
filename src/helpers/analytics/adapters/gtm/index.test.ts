import { afterEach, describe, expect, test } from 'vitest'

import { EVENTS } from '../../events'
import { clearGtmUserId, sendGtmEvent, setGtmUserId } from './index'

const signUpPayload = {
  method: 'otp',
  user_id: 'user-42',
  user_type: 'buyer',
}

describe('sendGtmEvent', () => {
  afterEach(() => {
    delete window.dataLayer
  })

  test('dual-pushes sign_up with user_data and flat payload shapes', () => {
    window.dataLayer = []

    sendGtmEvent(EVENTS.REGISTER, signUpPayload)

    expect(window.dataLayer).toEqual([
      {
        event: EVENTS.REGISTER,
        user_data: signUpPayload,
      },
      {
        event: EVENTS.REGISTER,
        ...signUpPayload,
      },
    ])
  })

  test('appends sign_up events when dataLayer already has events', () => {
    window.dataLayer = [{ event: 'page_view' }]

    sendGtmEvent(EVENTS.REGISTER, signUpPayload)

    expect(window.dataLayer).toEqual([
      { event: 'page_view' },
      {
        event: EVENTS.REGISTER,
        user_data: signUpPayload,
      },
      {
        event: EVENTS.REGISTER,
        ...signUpPayload,
      },
    ])
  })

  test('pushes a single flat payload for login', () => {
    window.dataLayer = []

    sendGtmEvent(EVENTS.LOGIN, {
      method: 'otp',
      user_id: 'user-42',
      user_type: 'buyer',
    })

    expect(window.dataLayer).toEqual([
      {
        event: EVENTS.LOGIN,
        method: 'otp',
        user_id: 'user-42',
        user_type: 'buyer',
      },
    ])
  })

  test('pushes a single flat payload for non-register events', () => {
    window.dataLayer = []

    sendGtmEvent('custom_event', { foo: 'bar' })

    expect(window.dataLayer).toEqual([{ event: 'custom_event', foo: 'bar' }])
  })

  test('clears the previous ecommerce object before pushing an ecommerce event', () => {
    window.dataLayer = []
    const ecommerce = { currency: 'IRR', value: 10, items: [{ item_id: '1' }] }

    sendGtmEvent(EVENTS.ADD_TO_CART, { ecommerce })

    expect(window.dataLayer).toEqual([
      { ecommerce: null },
      { event: EVENTS.ADD_TO_CART, ecommerce },
    ])
  })

  test('does not clear ecommerce for non-ecommerce events', () => {
    window.dataLayer = []

    sendGtmEvent(EVENTS.LOGIN, { method: 'otp' })

    expect(window.dataLayer).toEqual([{ event: EVENTS.LOGIN, method: 'otp' }])
  })

  test('does nothing when dataLayer is missing', () => {
    sendGtmEvent(EVENTS.REGISTER, signUpPayload)

    expect(window.dataLayer).toBeUndefined()
  })
})

describe('GTM user identity', () => {
  afterEach(() => {
    delete window.dataLayer
  })

  test('setGtmUserId pushes user_id onto the dataLayer', () => {
    window.dataLayer = []

    setGtmUserId('U-42')

    expect(window.dataLayer).toEqual([{ user_id: 'U-42' }])
  })

  test('clearGtmUserId nulls user_id on the dataLayer', () => {
    window.dataLayer = [{ user_id: 'U-42' }]

    clearGtmUserId()

    expect(window.dataLayer).toEqual([{ user_id: 'U-42' }, { user_id: null }])
  })
})
