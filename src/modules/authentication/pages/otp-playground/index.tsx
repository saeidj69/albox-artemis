'use client'

import { useMemo, useState } from 'react'

import { RiEditLine } from '@remixicon/react'

import Animate from '@/components/Animate'

import { persianDigits } from '@/utils/numbers'

import Button from '@/lib/Button'
import FlipDigits from '@/lib/FlipDigits'
import IconButton from '@/lib/IconButton'
import InputOtp from '@/lib/InputOtp'

const DEMO_PHONE = '+989123456789'

/**
 * Standalone OTP layout (mirrors login OTP step) for manual QA of `InputOtp`.
 * No auth, API, or storage — remove route when no longer needed.
 */
const OtpPlaygroundPage = () => {
  const [otp, setOtp] = useState('')
  const [simulateError, setSimulateError] = useState(false)

  const remainingSeconds = 125
  const remainingTime = useMemo(() => {
    const minutesLeft = Math.floor(remainingSeconds / 60)
    const secondsLeft = remainingSeconds - minutesLeft * 60
    return { minutes: minutesLeft, seconds: secondsLeft }
  }, [remainingSeconds])

  return (
    <div className="bg-background-main flex min-h-dvh flex-col">
      <div className="flex h-full flex-col px-5 pt-8 pb-5">
        <div className="flex flex-col items-center text-center">
          <Animate animation="slideUp" delay={0}>
            <h1 className="typo-title-medium text-text-primary flex items-center gap-2">
              <span dir="ltr">{persianDigits(DEMO_PHONE)}</span>
              <IconButton
                size="medium"
                variant="secondary"
                icon={<RiEditLine />}
                type="button"
                aria-label="غیرفعال در حالت آزمایشی"
                disabled
              />
            </h1>
          </Animate>

          <Animate animation="slideUp" delay={200}>
            <p className="typo-body-medium text-text-secondary mt-1 mb-8">
              کد ارسال شده به شماره بالا را وارد کنید
            </p>
          </Animate>
        </div>

        <Animate
          animation="slideUp"
          delay={400}
          className="flex flex-col items-center"
        >
          <InputOtp
            autoFocus
            length={5}
            value={otp}
            error={simulateError}
            onChange={setOtp}
          />
          {simulateError ? (
            <p
              role="alert"
              className="typo-body-small text-error-main mt-3 text-center"
            >
              پیام خطای آزمایشی
            </p>
          ) : null}
          <p
            className="typo-body-x-small text-text-tertiary mt-3 font-mono"
            dir="ltr"
          >
            value: &quot;{otp}&quot;
          </p>
        </Animate>

        <div className="mt-auto flex w-full flex-col gap-4 pt-8">
          <Animate animation="slideUp" delay={600}>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center">
                  <FlipDigits
                    value={remainingTime.seconds}
                    minDigits={2}
                    className="text-secondary-600"
                  />
                  <span className="mx-1 animate-pulse">:</span>
                  <FlipDigits
                    value={remainingTime.minutes}
                    minDigits={2}
                    className="text-secondary-600"
                  />
                </div>
                <div className="typo-body-medium text-text-primary">
                  تا ارسال مجدد کد
                </div>
              </div>
            </div>
          </Animate>

          <Animate animation="slideUp" delay={800}>
            <div className="flex w-full flex-col gap-2">
              <Button
                type="button"
                size="large"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setOtp('')
                  setSimulateError(false)
                }}
              >
                پاک کردن ورودی
              </Button>
              <Button
                type="button"
                size="large"
                variant="primary"
                className="w-full"
                onClick={() => setSimulateError((v) => !v)}
              >
                {simulateError ? 'پنهان کردن خطا' : 'نمایش خطا'}
              </Button>
            </div>
          </Animate>
        </div>
      </div>
    </div>
  )
}

export default OtpPlaygroundPage
