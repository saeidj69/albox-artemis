import { expect, test, type Page } from '@playwright/test'

const PRODUCT_ID = 101
const PRODUCT_TITLE = 'محصول تست سبد خرید'

const cartLines = [
  {
    type: 'product',
    productId: PRODUCT_ID,
    quantity: 2,
    title: PRODUCT_TITLE,
    priceWhenAdded: 100_000,
    addedAt: 1_700_000_000_000,
  },
]

const profileOk = {
  profile: {
    mobileNumber: '09123456789',
    firstName: 'علی',
    lastName: 'تستی',
    nationalCode: '0012345678',
    nationalCodeVerificationStatus: {
      value: 'verified',
      label: 'تایید شده',
    },
    referralCode: 'REF123',
    surenaCode: null,
    metadata: {},
    isImpersonating: false,
  },
}

const profileUnverified = {
  profile: {
    ...profileOk.profile,
    nationalCodeVerificationStatus: {
      value: 'pending',
      label: 'در انتظار تایید',
    },
  },
}

const addressOk = {
  addresses: [
    {
      id: 1,
      isPrimary: true,
      name: 'خانه',
      location: { latitude: 35.6892, longitude: 51.389 },
      address: 'تهران، خیابان تست',
      buildingNumber: 12,
      unit: '1',
      provinceName: 'تهران',
      cityName: 'تهران',
      postalCode: '1234567890',
    },
  ],
}

const checkBasketOk = {
  basket: {
    isOk: true,
    products: [
      {
        productId: PRODUCT_ID,
        quantity: 2,
        status: 'ok',
        errorMessages: [],
        details: {
          name: PRODUCT_TITLE,
          maxPurchaseQuantity: 10,
          isOutOfStock: false,
          boxRetailPrice: 100_000,
          netPrice: 100_000,
          discountPercentage: 0,
          unitInBox: 1,
          images: [],
        },
      },
    ],
    totalProductsPriceWithoutDiscount: 200_000,
    deliveryFeeWithoutDiscount: null,
    deliveryFeeDiscount: null,
    netDeliveryFee: null,
    totalProductsDiscount: 0,
    totalPrice: 200_000,
    timeslotOptions: [
      {
        id: 55,
        deliveryDate: '2026-08-02',
        deliveryStartTime: '10:00:00',
        deliveryEndTime: '12:00:00',
        isFull: false,
        deliveryFee: 50000,
      },
    ],
    appliedRules: [],
  },
}

const paymentMethodsOk = {
  methods: [
    {
      type: { value: 'ipg', label: 'پرداخت آنلاین' },
      maxAvailableAmount: 1_000_000,
      isAvailable: true,
    },
    {
      type: { value: 'cod', label: 'پرداخت در محل' },
      maxAvailableAmount: 500_000,
      isAvailable: true,
    },
    {
      type: { value: 'credit', label: 'کیف پول' },
      maxAvailableAmount: 50_000,
      isAvailable: true,
      breakDown: [],
    },
  ],
}

const clientStateOk = {
  value: JSON.stringify(cartLines),
  version: 1,
}

async function setupMocks(page: Page, overrides?: { profile?: unknown }) {
  await page.route('**/user/profile', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(overrides?.profile ?? profileOk),
      })
      return
    }
    await route.fallback()
  })

  await page.route('**/user/users/me/addresses', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(addressOk),
    })
  })

  await page.route('**/user/users/me/client-state/**', async (route) => {
    const method = route.request().method()
    if (method === 'GET' || method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(clientStateOk),
      })
      return
    }
    await route.fulfill({ status: 200, body: '{}' })
  })

  await page.route('**/order/basket/check', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(checkBasketOk),
    })
  })

  await page.route('**/payment/client/methods', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paymentMethodsOk),
    })
  })

  await page.route('**/order/customers/orders', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 999, redirectUrl: null }),
    })
  })

  await page.route('**/calendar**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ events: [] }),
    })
  })
}

async function seedCheckoutState(page: Page) {
  await page.addInitScript(
    ({ lines, draft }) => {
      window.localStorage.setItem('cart-v3', JSON.stringify(lines))
      window.localStorage.setItem('purchase-v3', JSON.stringify(draft))
    },
    {
      lines: cartLines,
      draft: {
        selectedTimeSlotId: 55,
        selectedPaymentMethod: 'cod',
        walletUsage: false,
        comment: 'E2E Test Order',
      },
    },
  )
}

test.describe('Checkout Flow', () => {
  test('renders checkout page with address, delivery timeslot, and submits order', async ({
    page,
  }) => {
    await setupMocks(page)
    await seedCheckoutState(page)

    await page.goto('/checkout')

    await expect(page.getByText('تایید نهایی و پرداخت')).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText('خانه')).toBeVisible({ timeout: 15_000 })

    const submitBtn = page.getByRole('button', { name: 'نهایی کردن سفارش' })
    await expect(submitBtn).toBeEnabled({ timeout: 15_000 })
    await submitBtn.evaluate((btn) => (btn as HTMLButtonElement).click())

    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 })
  })

  test('disables payment submission when national code is unverified', async ({
    page,
  }) => {
    await setupMocks(page, { profile: profileUnverified })
    await seedCheckoutState(page)

    await page.goto('/checkout')

    await expect(page.getByText('کد ملی شما تایید نشده است')).toBeVisible({
      timeout: 15_000,
    })
    const submitBtn = page.getByRole('button', { name: 'نهایی کردن سفارش' })
    await expect(submitBtn).toBeDisabled()
  })
})
