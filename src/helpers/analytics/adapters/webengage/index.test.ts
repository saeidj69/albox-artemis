import { afterEach, describe, expect, test, vi } from 'vitest'

import { EVENTS } from '../../events'
import {
  loginWebEngageUser,
  logoutWebEngageUser,
  sendWebEngageEvent,
  setWebEngageUserAttributes,
} from './index'

const signUpPayload = {
  mode: 'otp',
}

const viewItemPayload = {
  item_id: '101',
  item_name: 'تست محصول',
  item_category: 'روغن',
  item_brand: 'بهار',
  discount: 20_000,
  cashback_percentage: 2,
  item_price: 100_000,
}

describe('WebEngage identity helpers', () => {
  afterEach(() => {
    delete window.webengage
  })

  test('loginWebEngageUser calls user.login with the CUID', () => {
    const login = vi.fn()
    window.webengage = { user: { login } }

    loginWebEngageUser('user-42')

    expect(login).toHaveBeenCalledWith('user-42')
  })

  test('loginWebEngageUser skips empty ids', () => {
    const login = vi.fn()
    window.webengage = { user: { login } }

    loginWebEngageUser('')

    expect(login).not.toHaveBeenCalled()
  })

  test('logoutWebEngageUser calls user.logout', () => {
    const logout = vi.fn()
    window.webengage = { user: { logout } }

    logoutWebEngageUser()

    expect(logout).toHaveBeenCalledTimes(1)
  })

  test('setWebEngageUserAttributes drops empty values', () => {
    const setAttribute = vi.fn()
    window.webengage = { user: { setAttribute } }

    setWebEngageUserAttributes({
      we_phone: '+989123456789',
      we_first_name: '',
      we_last_name: undefined,
    })

    expect(setAttribute).toHaveBeenCalledWith({ we_phone: '+989123456789' })
  })
})

describe('sendWebEngageEvent', () => {
  afterEach(() => {
    delete window.webengage
  })

  test('tracks sign_up', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.REGISTER, signUpPayload)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.REGISTER, signUpPayload)
  })

  test('tracks view_item', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.VIEW_ITEM, viewItemPayload)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_ITEM, viewItemPayload)
  })

  test('tracks view_category', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.VIEW_CATEGORY, {
      item_category: 'روغن',
      item_subcategory: 'روغن مایع',
    })

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CATEGORY, {
      item_category: 'روغن',
      item_subcategory: 'روغن مایع',
    })
  })

  test('tracks view_games', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.VIEW_GAMES, { game_name: 6 })

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_GAMES, { game_name: 6 })
  })

  test('tracks view_campaign', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.VIEW_CAMPAIGN, { campaign_name: 1 })

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CAMPAIGN, {
      campaign_name: 1,
    })
  })

  test('tracks view_cart', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.VIEW_CART, {
      item_count: 2,
      value: 200_000,
      item_id: '101,202',
    })

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CART, {
      item_count: 2,
      value: 200_000,
      item_id: '101,202',
    })
  })

  test('tracks view_checkout', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.VIEW_CHECKOUT, {
      wallet_has_balance: 1,
      timeslot: '۱۰:00 - ۱۲:00',
    })

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CHECKOUT, {
      wallet_has_balance: 1,
      timeslot: '۱۰:00 - ۱۲:00',
    })
  })

  test('tracks order_submit', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.ORDER_SUBMIT, {
      selected_payment_method: 1,
      item_id: '101',
      item_count: 2,
      value: 200_000,
      coupon: '',
    })

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.ORDER_SUBMIT, {
      selected_payment_method: 1,
      item_id: '101',
      item_count: 2,
      value: 200_000,
      coupon: '',
    })
  })

  test('tracks name-only basket events without attributes', () => {
    const track = vi.fn()
    window.webengage = { track }

    sendWebEngageEvent(EVENTS.BASKET_INITIATED, true)
    sendWebEngageEvent(EVENTS.BASKET_CLEARED, true)

    expect(track).toHaveBeenNthCalledWith(1, EVENTS.BASKET_INITIATED)
    expect(track).toHaveBeenNthCalledWith(2, EVENTS.BASKET_CLEARED)
  })

  test('does not track events outside the WebEngage allowlist', () => {
    const track = vi.fn()
    const login = vi.fn()
    window.webengage = { track, user: { login } }

    sendWebEngageEvent(EVENTS.PURCHASE, { order_id: '1' })

    expect(login).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
  })

  test('does nothing when webengage is missing', () => {
    expect(() =>
      sendWebEngageEvent(EVENTS.REGISTER, signUpPayload),
    ).not.toThrow()
  })
})
