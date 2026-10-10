'use client'

import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import { useRouter } from 'next/navigation'

import { OtpRegExp, ROUTES } from '@/constants'
import { EVENTS, track } from '@/helpers/analytics'
import useFingerprint from '@/hooks/useFingerprint'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiEditLine } from '@remixicon/react'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import * as z from 'zod'

import Animate from '@/components/Animate'

import { loginStateAtom } from '@/modules/authentication/atoms/login-state'
import { useReadOtpFromSms } from '@/modules/authentication/hooks/use-read-otp-from-sms'
import { calculateRemainingSeconds } from '@/modules/authentication/utils/expire'
import { setRegistrationPending } from '@/modules/authentication/utils/registration-storage'

import { englishDigits, persianDigits } from '@/utils/numbers'

import { useGenerateOtp, useVerifyOtp } from '@/api/functions/auth'
import { getProfileQueryKey } from '@/api/functions/profile'
import { getErrorMessageFromErrorResponse } from '@/api/mutator/utils/error-message'

import { queryClient } from '@/providers/ReactQuery'

import Button from '@/lib/Button'
import FlipDigits from '@/lib/FlipDigits'
import IconButton from '@/lib/IconButton'
import InputOtp from '@/lib/InputOtp'

const schema = z.object({
  otp: z
    .string()
    .transform((s) => s.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .min(1, 'لطفا کد تایید خود را وارد کنید')
        .regex(OtpRegExp, { message: 'کد تایید باید ۵ عدد باشد' }),
    ),
})

type InputForm = z.infer<typeof schema>

/* eslint-disable react-hooks/exhaustive-deps */

const OtpForm: FC = () => {
  const router = useRouter()

  const { fingerprint } = useFingerprint()
  const loginState = useAtomValue(loginStateAtom)

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingSeconds(loginState.resendAvailableAt),
  )

  const setLoginState = useSetAtom(loginStateAtom)
  const { mutate: generateOtp, isPending: isGeneratingOtp } = useGenerateOtp()
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp()

  const lastSubmittedOtpRef = useRef<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InputForm>({
    resolver: zodResolver(schema),
  })

  useReadOtpFromSms({
    enabled: !isVerifyingOtp,
    onOtpRead: (digits) => {
      lastSubmittedOtpRef.current = null

      setValue('otp', digits, { shouldDirty: true, shouldValidate: true })
    },
  })

  const handleResendOtp = () => {
    if (!loginState.phoneNumber) return

    generateOtp(
      { data: { mobileNumber: loginState.phoneNumber, scope: 'client' } },
      {
        onSuccess(response) {
          const ttl = response?.ttl ?? 0
          const resendTtl = response?.resendTtl ?? 0
          const now = Date.now()
          const expiresAt = ttl ? now + ttl * 1000 : 0
          const resendAvailableAt = resendTtl ? now + resendTtl * 1000 : 0

          setLoginState((prev) => ({
            expiresAt,
            resendAvailableAt,
            step: 'otp',
            previousStep: prev.previousStep,
            phoneNumber: loginState.phoneNumber,
          }))

          setRemainingSeconds(calculateRemainingSeconds(resendAvailableAt))

          setValue('otp', '')
          lastSubmittedOtpRef.current = null

          toast.success('کد تایید با موفقیت ارسال شد')
        },
      },
    )
  }

  const onSubmit: SubmitHandler<InputForm> = (data) => {
    if (calculateRemainingSeconds(loginState.expiresAt) <= 0) return

    const normalizedOtp = englishDigits(data.otp)

    verifyOtp(
      {
        data: {
          mobileNumber: loginState.phoneNumber,
          otp: normalizedOtp,
          fingerprint: fingerprint ?? undefined,
        },
      },
      {
        onSuccess(response) {
          queryClient.removeQueries({ queryKey: getProfileQueryKey() })

          if (response?.state === 'pending_registration') {
            const registrationTtl =
              response.metadata?.registrationTtl ?? 10 * 60
            setRegistrationPending(Date.now() + registrationTtl * 1000)

            router.replace(ROUTES.AUTH.REGISTER)

            return
          }

          if (response?.state === 'valid') {
            const payload = {
              method: 'otp' as const,
              user_id: response.profile?.id ?? '',
              user_type: 'buyer' as const,
            }

            track(EVENTS.LOGIN, {
              gtm: payload,
            })
          }

          router.replace(ROUTES.HOME)
        },
        onError(error) {
          const errorMessage = getErrorMessageFromErrorResponse(
            error?.response?.data,
          )

          setError('otp', {
            type: 'manual',
            message: errorMessage,
          })
        },
      },
    )
  }

  const onGoBack = () => {
    setLoginState((prev) => ({
      expiresAt: 0,
      resendAvailableAt: 0,
      phoneNumber: '',
      step: 'phoneNumber',
      previousStep: prev.previousStep,
    }))
  }

  useEffect(() => {
    window.history.pushState({ loginStep: 'otp' }, '')

    const handlePopState = () => {
      setLoginState((prev) => ({
        expiresAt: 0,
        resendAvailableAt: 0,
        phoneNumber: '',
        step: 'phoneNumber',
        previousStep: prev.previousStep,
      }))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (remainingSeconds <= 0) return

    const intervalId = setInterval(() => {
      setRemainingSeconds(
        calculateRemainingSeconds(loginState.resendAvailableAt),
      )
    }, 1000)

    return () => clearInterval(intervalId)
  }, [loginState.resendAvailableAt, remainingSeconds])

  const remainingTime = useMemo(() => {
    const minutesLeft = Math.floor(remainingSeconds / 60)
    const secondsLeft = remainingSeconds - minutesLeft * 60

    return {
      minutes: minutesLeft,
      seconds: secondsLeft,
    }
  }, [remainingSeconds])

  const ANIMATION_DELAY = useMemo(
    () => (loginState.previousStep === 'phoneNumber' ? 0 : 1000),
    [],
  )

  const otpValue = watch('otp')
  const isResendPhase = remainingSeconds <= 0
  const isOtpExpired = calculateRemainingSeconds(loginState.expiresAt) <= 0

  useEffect(() => {
    clearErrors('otp')
  }, [otpValue, clearErrors])

  useEffect(() => {
    if (
      otpValue?.length === 5 &&
      otpValue !== lastSubmittedOtpRef.current &&
      !isVerifyingOtp &&
      !isOtpExpired
    ) {
      lastSubmittedOtpRef.current = otpValue
      onSubmit({ otp: otpValue })
    }
  }, [otpValue, isVerifyingOtp, isOtpExpired])

  return (
    <form
      className="flex h-full flex-col px-5 pt-8 pb-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center text-center">
        <Animate animation="slideUp" delay={ANIMATION_DELAY}>
          <h1 className="typo-title-medium text-text-primary flex items-center gap-2">
            <span dir="ltr">{persianDigits(loginState.phoneNumber)}</span>
            <IconButton
              size="medium"
              variant="secondary"
              icon={<RiEditLine />}
              onClick={onGoBack}
            />
          </h1>
        </Animate>

        <Animate animation="slideUp" delay={ANIMATION_DELAY + 200}>
          <p className="typo-body-medium text-text-secondary mt-1 mb-8">
            کد ارسال شده به شماره بالا را وارد کنید
          </p>
        </Animate>
      </div>

      <Animate
        animation="slideUp"
        delay={ANIMATION_DELAY + 400}
        className="flex flex-col items-center"
      >
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <InputOtp
              autoFocus
              length={5}
              value={field.value}
              error={!!errors.otp}
              onChange={field.onChange}
            />
          )}
        />
        {errors.otp?.message ? (
          <p
            role="alert"
            className="typo-body-small text-error-main mt-3 text-center"
          >
            {errors.otp.message}
          </p>
        ) : null}
      </Animate>

      <div className="mt-auto flex w-full flex-col gap-4 pt-8">
        {remainingSeconds > 0 ? (
          <Animate animation="slideUp" delay={ANIMATION_DELAY + 600}>
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
        ) : null}

        <Animate
          animation="slideUp"
          delay={ANIMATION_DELAY + (remainingSeconds > 0 ? 800 : 600)}
        >
          <Button
            type={isResendPhase ? 'button' : 'submit'}
            size="large"
            className="w-full"
            loading={isResendPhase ? isGeneratingOtp : isVerifyingOtp}
            disabled={
              isResendPhase
                ? isGeneratingOtp
                : (otpValue?.length ?? 0) < 5 || isVerifyingOtp
            }
            onClick={isResendPhase ? handleResendOtp : undefined}
          >
            {isResendPhase ? 'دریافت مجدد کد' : 'ورود'}
          </Button>
        </Animate>
      </div>
    </form>
  )
}

export default OtpForm
