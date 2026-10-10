import * as Sentry from '@sentry/nextjs'
import { type AxiosError, isCancel } from 'axios'

import { serializePayload } from './serialize-payload'

const ID_SEGMENT =
  /^(?:\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{24})$/i

/** Strips origin/query and replaces ID-like segments so issues group per endpoint. */
export const normalizeApiPath = (url = ''): string => {
  const { pathname } = new URL(url, 'http://placeholder')

  return pathname
    .split('/')
    .map((segment) => (ID_SEGMENT.test(segment) ? ':id' : segment))
    .join('/')
}

/** Every failed API call is reported, except requests the app cancelled itself. */
export const shouldReportApiError = (error: AxiosError): boolean =>
  !isCancel(error)

/** Query params from `config.params` merged with any already embedded in the URL. */
const getQuery = (error: AxiosError): unknown => {
  const { search } = new URL(error.config?.url ?? '', 'http://placeholder')
  const fromUrl = Object.fromEntries(new URLSearchParams(search))
  const params = error.config?.params

  return params && typeof params === 'object'
    ? { ...fromUrl, ...params }
    : fromUrl
}

const isEmptyObject = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && Object.keys(value).length === 0

/** A malformed payload must only cost us that one field, never the report. */
const safeSerialize = (read: () => unknown): string | undefined => {
  try {
    const value = read()

    return isEmptyObject(value) ? undefined : serializePayload(value)
  } catch {
    return undefined
  }
}

/**
 * Reports an API failure with its query params and request/response bodies so
 * validation failures (e.g. 422) are debuggable. Payloads are sent as-is but capped
 * by `serializePayload`; headers are never attached.
 *
 * Runs inside the Axios error interceptor, so it must never throw: a failure here
 * would replace the original AxiosError and skip the caller's error handling.
 */
export const reportApiError = (error: AxiosError): void => {
  try {
    if (!shouldReportApiError(error)) return

    const method = (error.config?.method ?? 'get').toUpperCase()
    const path = normalizeApiPath(error.config?.url)
    const status = error.response?.status
    const statusLabel = status ? String(status) : (error.code ?? 'network')

    Sentry.withScope((scope) => {
      scope.setTag('api.method', method)
      scope.setTag('api.status', statusLabel)
      // 4xx are usually client/validation issues — keep them separable from 5xx/network.
      scope.setLevel(status && status < 500 ? 'warning' : 'error')
      scope.setContext('api', {
        method,
        path,
        status,
        code: error.code,
        query: safeSerialize(() => getQuery(error)),
        requestBody: safeSerialize(() => error.config?.data),
        responseBody: safeSerialize(() => error.response?.data),
      })
      scope.setFingerprint(['api-error', method, path, statusLabel])
      Sentry.captureException(error)
    })
  } catch {
    // Reporting is best-effort; never let it affect the request's error flow.
  }
}
