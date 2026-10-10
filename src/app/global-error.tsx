'use client'

import { useEffect } from 'react'

import NextError from 'next/error'

import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  // Server-side errors (with `digest`) are already reported via `onRequestError`.
  useEffect(() => {
    if (!error.digest) Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
