import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { describe, expect, it } from 'vitest'

import {
  getErrorCodeFromUnknown,
  getHttpStatusFromUnknown,
} from './error-message'

const axiosError = (args: { status?: number; code?: number; data?: unknown }) =>
  new AxiosError(
    'request failed',
    undefined,
    {} as InternalAxiosRequestConfig,
    undefined,
    {
      status: args.status ?? 500,
      data: args.data ?? (args.code != null ? { code: args.code } : {}),
      headers: {},
      statusText: '',
      config: {} as InternalAxiosRequestConfig,
    } as AxiosResponse,
  )

describe('error-message axios helpers', () => {
  it('reads Jupiter code and HTTP status from an Axios error', () => {
    const error = axiosError({ status: 404, code: 5024 })
    expect(getErrorCodeFromUnknown(error)).toBe(5024)
    expect(getHttpStatusFromUnknown(error)).toBe(404)
  })

  it('returns null for non-Axios errors', () => {
    expect(getErrorCodeFromUnknown(new Error('x'))).toBeNull()
    expect(getHttpStatusFromUnknown(new Error('x'))).toBeNull()
  })
})
