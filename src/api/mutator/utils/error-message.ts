import axios from 'axios'

const DEFAULT_API_ERROR_MESSAGE = 'خطایی رخ داده است'

const asErrorRecord = (
  errorResponse: unknown,
): Record<string, unknown> | null => {
  if (!errorResponse || typeof errorResponse !== 'object') {
    return null
  }

  return errorResponse as Record<string, unknown>
}

/**
 * Reads Jupiter's numeric `code` from an API error body.
 */
export function getErrorCodeFromErrorResponse(
  errorResponse: unknown,
): number | null {
  const record = asErrorRecord(errorResponse)
  if (record == null) return null

  const code = record.code
  return typeof code === 'number' ? code : null
}

/**
 * Parses API error `response.data` (or equivalent) and returns a user-facing message.
 */
export function getErrorMessageFromErrorResponse(
  errorResponse: unknown,
  fallbackMessage: string = DEFAULT_API_ERROR_MESSAGE,
): string {
  const record = asErrorRecord(errorResponse)
  if (record == null) {
    return fallbackMessage
  }

  const message = record.message
  if (message != null && message !== '') {
    return String(message)
  }

  return fallbackMessage
}

/** Jupiter `code` from an Axios (or similar) rejection. */
export function getErrorCodeFromUnknown(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null
  return getErrorCodeFromErrorResponse(error.response?.data)
}

/** HTTP status from an Axios (or similar) rejection. */
export function getHttpStatusFromUnknown(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null
  const status = error.response?.status
  return typeof status === 'number' ? status : null
}
