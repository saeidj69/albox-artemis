'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import {
  RiArrowGoBackLine,
  RiFileCopyLine,
  RiHomeLine,
  RiRefreshLine,
} from '@remixicon/react'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

import Alert from '@/lib/Alert'
import Button from '@/lib/Button'
import { cn } from '@/lib/utils'

type GlobalAppErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

type DetailRow = { label: string; value: string }

const getAxiosDetails = (error: unknown): DetailRow[] => {
  if (!axios.isAxiosError(error)) return []

  const rows: DetailRow[] = []

  if (error.code) rows.push({ label: 'کد', value: error.code })

  const status = error.response?.status
  const statusText = error.response?.statusText
  if (typeof status === 'number') {
    rows.push({
      label: 'وضعیت HTTP',
      value: statusText ? `${status} ${statusText}` : String(status),
    })
  }

  const method = error.config?.method?.toUpperCase()
  const url = error.config?.url
  if (method || url) {
    rows.push({
      label: 'درخواست',
      value: [method, url].filter(Boolean).join(' '),
    })
  }

  const data = error.response?.data
  if (data !== undefined && data !== null) {
    let body: string
    try {
      body = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    } catch {
      body = String(data)
    }
    rows.push({ label: 'پاسخ سرور', value: body })
  }

  return rows
}

const getCauseChain = (error: unknown): DetailRow[] => {
  const rows: DetailRow[] = []
  let current: unknown = (error as { cause?: unknown })?.cause
  let depth = 1
  while (current && depth <= 5) {
    if (current instanceof Error) {
      rows.push({
        label: `علت (${depth})`,
        value: [current.name, current.message].filter(Boolean).join(': '),
      })
      current = (current as { cause?: unknown }).cause
    } else {
      rows.push({ label: `علت (${depth})`, value: String(current) })
      current = undefined
    }
    depth += 1
  }
  return rows
}

const GlobalAppError = ({ error, reset }: GlobalAppErrorProps) => {
  const [showStack, setShowStack] = useState(false)

  // Server-side errors (with `digest`) are already reported via `onRequestError`.
  useEffect(() => {
    if (!error.digest) Sentry.captureException(error)
  }, [error])

  const details = useMemo<DetailRow[]>(() => {
    const rows: DetailRow[] = []
    if (error.name && error.name !== 'Error') {
      rows.push({ label: 'نوع', value: error.name })
    }
    if (error.digest) {
      rows.push({ label: 'شناسه رخداد', value: error.digest })
    }
    if (typeof window !== 'undefined') {
      rows.push({ label: 'آدرس', value: window.location.href })
    }
    rows.push({ label: 'زمان', value: new Date().toISOString() })
    rows.push(...getAxiosDetails(error))
    rows.push(...getCauseChain(error))
    return rows
  }, [error])

  const fullReport = useMemo(() => {
    const lines: string[] = []
    lines.push(`Message: ${error.message || '(no message)'}`)
    for (const { label, value } of details) {
      lines.push(`${label}: ${value}`)
    }
    if (error.stack) {
      lines.push('')
      lines.push('Stack:')
      lines.push(error.stack)
    }
    return lines.join('\n')
  }, [details, error])

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullReport)
        toast.success('جزئیات خطا کپی شد')
        return
      }
      throw new Error('clipboard unavailable')
    } catch {
      toast.error('کپی کردن ممکن نبود')
    }
  }

  const handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <div className="container flex min-h-dvh flex-col justify-center gap-6 py-10">
      <div className="space-y-2 text-center">
        <h2 className="typo-title-medium text-text-primary">
          خطایی در برنامه رخ داد
        </h2>
        <p className="typo-body-medium text-text-secondary">
          متاسفیم، مشکلی پیش آمده است. می‌توانید دوباره تلاش کنید یا به صفحه
          اصلی بازگردید.
        </p>
      </div>

      <Alert
        variant="error"
        title={error.message || 'خطای ناشناخته'}
        classNames={{ root: 'w-full', description: 'wrap-break-word' }}
      >
        {error.name && error.name !== 'Error' ? error.name : null}
      </Alert>

      {details.length > 0 && (
        <section
          aria-label="جزئیات خطا"
          className="rounded-brand border-border-main overflow-hidden border"
        >
          <header className="bg-background-secondary typo-title-small text-text-primary border-border-main border-b px-4 py-2">
            جزئیات
          </header>

          <dl className="divide-border-main divide-y">
            {details.map(({ label, value }) => (
              <div
                key={`${label}-${value.slice(0, 32)}`}
                className="grid grid-cols-[auto_1fr] items-start gap-3 px-4 py-2"
              >
                <dt className="typo-body-small text-text-secondary whitespace-nowrap">
                  {label}
                </dt>
                <dd
                  className={cn(
                    'typo-body-small text-text-primary min-w-0 wrap-break-word',
                    value.includes(' ') &&
                      'font-mono text-xs whitespace-pre-wrap',
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {error.stack && (
        <section
          aria-label="Stack trace"
          className="rounded-brand border-border-main overflow-hidden border"
        >
          <button
            type="button"
            onClick={() => setShowStack((v) => !v)}
            aria-expanded={showStack}
            className="bg-background-secondary hover:bg-background-tertiary typo-title-small text-text-primary flex w-full items-center justify-between gap-2 px-4 py-2 text-right transition-colors"
          >
            <span>Stack trace</span>
            <span className="typo-body-small text-text-secondary">
              {showStack ? 'بستن' : 'نمایش'}
            </span>
          </button>

          {showStack && (
            <pre
              dir="ltr"
              className="bg-background-main text-text-primary max-h-96 overflow-auto px-4 py-3 text-left font-mono text-xs whitespace-pre-wrap"
            >
              {error.stack}
            </pre>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="medium"
          variant="primary"
          startIcon={<RiRefreshLine />}
          onClick={reset}
        >
          تلاش مجدد
        </Button>

        <Button
          size="medium"
          variant="ghost"
          startIcon={<RiArrowGoBackLine />}
          onClick={handleReload}
        >
          ریلود
        </Button>

        <Button
          size="medium"
          variant="ghost"
          startIcon={<RiFileCopyLine />}
          onClick={handleCopy}
        >
          کپی جزئیات
        </Button>

        <Button
          size="medium"
          variant="ghost"
          as={Link}
          href={ROUTES.HOME}
          startIcon={<RiHomeLine />}
        >
          صفحه اصلی
        </Button>
      </div>
    </div>
  )
}

export default GlobalAppError
