'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

import { englishDigits, onlyDigits } from '@/utils/numbers'

/**
 * Web OTP API (`OTPCredential`): reads a one-time code from SMS when the carrier / OS
 * delivers a message that includes the origin-bound format (see MDN “Web OTP API”).
 *
 * Pattern based on common `navigator.credentials.get({ otp: { transport: ['sms'] } })`
 */
export type UseReadOtpFromSmsOptions = {
  /** Invoked with ASCII digits only, length `otpLength`, when the browser exposes a code. */
  onOtpRead: (otp: string) => void
  /** When false, cancels any in-flight request and does not start a new one. */
  enabled?: boolean
  /** Expected OTP length (digits). Codes with a different digit count are ignored. */
  otpLength?: number
}

type OtpCredentialLike = globalThis.Credential & { code: string }

function isOtpCredentialLike(value: unknown): value is OtpCredentialLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as { code: unknown }).code === 'string'
  )
}

export function useReadOtpFromSms({
  onOtpRead,
  enabled = true,
  otpLength = 5,
}: UseReadOtpFromSmsOptions) {
  const onOtpReadRef = useRef(onOtpRead)
  const otpLengthRef = useRef(otpLength)

  useLayoutEffect(() => {
    onOtpReadRef.current = onOtpRead
    otpLengthRef.current = otpLength
  }, [onOtpRead, otpLength])

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (!('OTPCredential' in window)) return
    if (!navigator.credentials?.get) return

    const abortController = new AbortController()

    void navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: abortController.signal,
      } as globalThis.CredentialRequestOptions)
      .then((credential) => {
        if (abortController.signal.aborted) return
        if (!isOtpCredentialLike(credential)) return

        const digits = onlyDigits(englishDigits(credential.code))
        const expected = otpLengthRef.current
        if (digits.length !== expected) return

        onOtpReadRef.current(digits)
      })
      .catch((error: unknown) => {
        if (
          error &&
          typeof error === 'object' &&
          'name' in error &&
          (error as { name: string }).name === 'AbortError'
        ) {
          return
        }
      })

    return () => {
      abortController.abort()
    }
  }, [enabled])
}
