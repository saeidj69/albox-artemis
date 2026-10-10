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

const clientStateOk = {
  value: JSON.stringify(cartLines),
  version: 1,
}

async function mockBasketApis(page: Page) {
  await page.route('**/user/profile', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(profileOk),
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
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(clientStateOk),
      })
      return
    }
    if (method === 'PUT') {
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

  await page.route('**/calendar**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ events: [] }),
    })
  })
}

async function seedCart(page: Page) {
  await page.addInitScript((lines) => {
    window.localStorage.setItem('cart-v3', JSON.stringify(lines))
  }, cartLines)
}

test.describe('Basket Flow', () => {
  test('shows seeded product and opens delivery timeslot sheet on submit', async ({
    page,
  }) => {
    await mockBasketApis(page)
    await seedCart(page)

    await page.goto('/basket')

    await expect(page.getByText(PRODUCT_TITLE).first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText('سبد خرید شما')).toBeVisible()

    const submit = page.getByRole('button', { name: 'تایید و تکمیل خرید' })
    await expect(submit).toBeEnabled({ timeout: 15_000 })
    await submit.click()

    await expect(page.getByText('انتخاب زمان ارسال').first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('closes the delivery timeslot sheet after navigating back', async ({
    page,
  }) => {
    await mockBasketApis(page)
    await seedCart(page)

    await page.goto('/design-system')
    await page.goto('/basket')

    const submit = page.getByRole('button', { name: 'تایید و تکمیل خرید' })
    await expect(submit).toBeEnabled({ timeout: 15_000 })
    await submit.click()

    await expect(page.getByText('انتخاب زمان ارسال').first()).toBeVisible({
      timeout: 10_000,
    })

    await page.goBack()

    await expect(page).toHaveURL(/\/design-system$/)
    await expect(page.getByText('انتخاب زمان ارسال').first()).not.toBeVisible()
  })

  test('redirects to login when profile request fails', async ({ page }) => {
    await page.route('**/user/profile', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
    })

    await page.goto('/basket')

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 })
  })

  test('shows empty state when cart has no lines', async ({ page }) => {
    await mockBasketApis(page)
    await page.route('**/user/users/me/client-state/**', async (route) => {
      const method = route.request().method()
      if (method === 'GET' || method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ value: JSON.stringify([]), version: 1 }),
        })
        return
      }
      await route.fulfill({ status: 200, body: '{}' })
    })
    await page.addInitScript(() => {
      window.localStorage.setItem('cart-v3', JSON.stringify([]))
    })

    await page.goto('/basket')

    await expect(
      page.getByText('محصولی در سبد خرید شما وجود ندارد.'),
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByRole('button', { name: 'تایید و تکمیل خرید' }),
    ).toHaveCount(0)
  })

  test('prompts to add an address when none exists', async ({ page }) => {
    await mockBasketApis(page)
    await page.route('**/user/users/me/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ addresses: [] }),
      })
    })
    await seedCart(page)

    await page.goto('/basket')

    const addAddress = page.getByRole('button', { name: 'افزودن آدرس' }).last()
    await expect(addAddress).toBeVisible({ timeout: 15_000 })
    await addAddress.click()

    await expect(page).toHaveURL(/\/addresses\/new/, { timeout: 15_000 })
  })

  test('blocks checkout and shows progress when below minimum basket price', async ({
    page,
  }) => {
    await mockBasketApis(page)
    await page.route('**/order/basket/check', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          basket: {
            ...checkBasketOk.basket,
            appliedRules: [
              {
                type: 'min_basket_price',
                passed: false,
                properties: { minBasketPrice: 500_000 },
              },
            ],
          },
        }),
      })
    })
    await seedCart(page)

    await page.goto('/basket')

    await expect(page.getByText('مبلغ باقی مانده تا حداقل خرید')).toBeVisible({
      timeout: 15_000,
    })
    await expect(
      page.getByRole('button', { name: 'تایید و تکمیل خرید' }),
    ).toBeDisabled()
  })

  test('shows change banner and removes an unpurchasable product on ack', async ({
    page,
  }) => {
    const SECOND_PRODUCT_ID = 202
    const SECOND_PRODUCT_TITLE = 'محصول تست دوم'

    await mockBasketApis(page)
    await page.route('**/order/basket/check', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          basket: {
            ...checkBasketOk.basket,
            isOk: false,
            products: [
              {
                productId: PRODUCT_ID,
                quantity: 2,
                status: 'error',
                errorMessages: ['این محصول موجود نیست.'],
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
              {
                productId: SECOND_PRODUCT_ID,
                quantity: 1,
                status: 'not_found',
                errorMessages: [],
                details: null,
              },
            ],
          },
        }),
      })
    })

    await page.addInitScript(
      ({ lines }) => {
        window.localStorage.setItem('cart-v3', JSON.stringify(lines))
      },
      {
        lines: [
          ...cartLines,
          {
            type: 'product',
            productId: SECOND_PRODUCT_ID,
            quantity: 1,
            title: SECOND_PRODUCT_TITLE,
            priceWhenAdded: 50_000,
            addedAt: 1_700_000_000_000,
          },
        ],
      },
    )

    await page.goto('/basket')

    await expect(page.getByText('تغییر در سبد خرید')).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText(PRODUCT_TITLE).first()).toBeVisible()

    await page.getByRole('button', { name: 'متوجه شدم' }).click()

    await expect(page.getByText(SECOND_PRODUCT_TITLE)).toHaveCount(0)
    await expect(page.getByText(PRODUCT_TITLE).first()).toBeVisible()
  })

  test('clears the basket from the trash action', async ({ page }) => {
    await mockBasketApis(page)
    await seedCart(page)

    await page.goto('/basket')

    await expect(page.getByText(PRODUCT_TITLE).first()).toBeVisible({
      timeout: 15_000,
    })

    await page
      .getByText('سبد خرید شما')
      .locator('..')
      .getByRole('button')
      .click()
    await expect(
      page
        .getByText('آیا می خواهید سبد خرید خود را حذف کنید؟')
        .and(page.locator(':not([data-slot="sheet-description"])')),
    ).toBeVisible()
    await page.getByRole('button', { name: 'حذف', exact: true }).click()

    await expect(
      page.getByText('محصولی در سبد خرید شما وجود ندارد.'),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('selects a delivery timeslot and proceeds to checkout', async ({
    page,
  }) => {
    await mockBasketApis(page)
    await seedCart(page)

    await page.goto('/basket')

    const submit = page.getByRole('button', { name: 'تایید و تکمیل خرید' })
    await expect(submit).toBeEnabled({ timeout: 15_000 })
    await submit.click()

    await expect(page.getByText('انتخاب زمان ارسال').first()).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole('radio').first().click()
    await page.getByRole('button', { name: 'تایید زمان ارسال' }).click()

    await expect(page).toHaveURL(/\/checkout/, { timeout: 15_000 })
  })
})
