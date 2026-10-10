import { AxiosError, AxiosHeaders, CanceledError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  normalizeApiPath,
  reportApiError,
  shouldReportApiError,
} from './report-api-error'

const mockCaptureException = vi.fn()
const mockScope = {
  setTag: vi.fn(),
  setLevel: vi.fn(),
  setContext: vi.fn(),
  setFingerprint: vi.fn(),
}

vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  withScope: (callback: (scope: typeof mockScope) => void) =>
    callback(mockScope),
}))

const createError = (status?: number, url = '/orders/42?page=2') => {
  const config = { url, method: 'post', headers: new AxiosHeaders() }

  return new AxiosError(
    'Request failed',
    status ? undefined : AxiosError.ETIMEDOUT,
    config,
    undefined,
    status
      ? { status, statusText: '', headers: {}, config, data: {} }
      : undefined,
  )
}

beforeEach(() => {
  mockCaptureException.mockReset()
  mockScope.setTag.mockReset()
  mockScope.setLevel.mockReset()
  mockScope.setContext.mockReset()
  mockScope.setFingerprint.mockReset()
})

describe('normalizeApiPath', () => {
  it('drops the query string and replaces ID segments', () => {
    expect(normalizeApiPath('/orders/42/items?page=2')).toBe(
      '/orders/:id/items',
    )
    expect(
      normalizeApiPath(
        'https://api.example.com/users/3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      ),
    ).toBe('/users/:id')
  })
})

describe('shouldReportApiError', () => {
  it('reports every HTTP and network failure', () => {
    expect(shouldReportApiError(createError(500))).toBe(true)
    expect(shouldReportApiError(createError(422))).toBe(true)
    expect(shouldReportApiError(createError(401))).toBe(true)
    expect(shouldReportApiError(createError())).toBe(true)
  })

  it('skips requests cancelled by the app', () => {
    expect(shouldReportApiError(new CanceledError())).toBe(false)
  })
})

describe('reportApiError', () => {
  it('captures a 5xx with low-cardinality tags and a per-endpoint fingerprint', () => {
    const error = createError(503)

    reportApiError(error)

    expect(mockCaptureException).toHaveBeenCalledWith(error)
    expect(mockScope.setTag).toHaveBeenCalledWith('api.status', '503')
    expect(mockScope.setFingerprint).toHaveBeenCalledWith([
      'api-error',
      'POST',
      '/orders/:id',
      '503',
    ])
  })

  it('captures client errors as warnings', () => {
    const error = createError(422)

    reportApiError(error)

    expect(mockCaptureException).toHaveBeenCalledWith(error)
    expect(mockScope.setLevel).toHaveBeenCalledWith('warning')
  })

  it('attaches query, request body, and response body to the api context', () => {
    const config = {
      url: '/user/users/me/addresses?page=2',
      method: 'post',
      params: { status: 'active' },
      data: JSON.stringify({ title: 'home', otp: '1234' }),
      headers: new AxiosHeaders({ Authorization: 'Bearer secret' }),
    }
    const error = new AxiosError(
      'Request failed',
      undefined,
      config,
      undefined,
      {
        status: 422,
        statusText: '',
        headers: {},
        config,
        data: { message: 'invalid', errors: { postal_code: ['required'] } },
      },
    )

    reportApiError(error)

    const [, context] = mockScope.setContext.mock.calls[0]

    expect(context).toMatchObject({
      method: 'POST',
      path: '/user/users/me/addresses',
      status: 422,
      query: '{"page":"2","status":"active"}',
      requestBody: '{"title":"home","otp":"1234"}',
      responseBody:
        '{"message":"invalid","errors":{"postal_code":["required"]}}',
    })
    expect(JSON.stringify(context)).not.toContain('Bearer')
  })

  it('omits query and bodies when the request has none', () => {
    reportApiError(createError(500, '/orders'))

    const [, context] = mockScope.setContext.mock.calls[0]

    expect(context.query).toBeUndefined()
    expect(context.requestBody).toBeUndefined()
    expect(context.responseBody).toBeUndefined()
  })

  it('never throws, and still reports when a payload cannot be read', () => {
    const error = createError(422)

    Object.defineProperty(error.response, 'data', {
      get: () => {
        throw new Error('boom')
      },
    })

    expect(() => reportApiError(error)).not.toThrow()
    expect(mockCaptureException).toHaveBeenCalledWith(error)

    const [, context] = mockScope.setContext.mock.calls[0]

    expect(context.responseBody).toBeUndefined()
  })

  it('never throws on a malformed request url', () => {
    const error = createError(500, 'http://')

    expect(() => reportApiError(error)).not.toThrow()
  })

  it('does not capture cancelled requests', () => {
    reportApiError(new CanceledError())

    expect(mockCaptureException).not.toHaveBeenCalled()
  })
})
