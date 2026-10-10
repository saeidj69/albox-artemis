import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPreparedPage } from '@/api/functions/clients-page'

import { MutatorConfig } from '.'
import { server } from '../../../vitest.setup'

const toastError = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}))

/** Jupiter's `PreparedPageNotFound` body for a page that was never created. */
const PAGE_NOT_FOUND_BODY = { message: 'صفحه یافت نشد', code: 4005 }

const params = { path: 'explore', latitude: 35.7, longitude: 51.4 }

const respondWithNotFound = () => {
  server.use(
    http.get('*/listing/prepared-pages', () =>
      HttpResponse.json(PAGE_NOT_FOUND_BODY, { status: 404 }),
    ),
  )
}

describe('mutator error toast', () => {
  beforeEach(() => {
    toastError.mockReset()
  })

  it('toasts a failed request by default', async () => {
    respondWithNotFound()

    await expect(getPreparedPage(params)).rejects.toBeDefined()

    expect(toastError).toHaveBeenCalledWith(PAGE_NOT_FOUND_BODY.message)
  })

  // The flag travels `request` option → generated fn → mutator → Axios config →
  // `error.config`. If that chain ever breaks, every user sees a red toast on a
  // page the admin simply hasn't created, so assert it end-to-end.
  it('stays silent when the caller opts out with skipErrorToast', async () => {
    respondWithNotFound()

    // What the hooks' `request` option becomes by the time it reaches the
    // generated function (which types its options as `RequestInit`).
    const silenced: MutatorConfig = {
      skipErrorToast: true,
    }

    await expect(getPreparedPage(params, silenced)).rejects.toBeDefined()

    expect(toastError).not.toHaveBeenCalled()
  })
})
