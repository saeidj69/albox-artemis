'use client'

import { FC, useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { PhoneNumberRegExp } from '@/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiPhoneFill } from '@remixicon/react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import * as z from 'zod'

import Animate from '@/components/Animate'

import { loginStateAtom } from '@/modules/authentication/atoms/login-state'

import { englishDigits } from '@/utils/numbers'

import { useGenerateOtp } from '@/api/functions/auth'

import Button from '@/lib/Button'
import Input from '@/lib/Input'

/** Digits accepted in phone field (matches `englishDigits` normalization). */
const PHONE_INPUT_DIGIT = /[0-9۰-۹٠-٩]/

function capMobileDigitInput(value: string, maxDigits: number): string {
  let digits = 0
  let out = ''
  for (const ch of value) {
    if (PHONE_INPUT_DIGIT.test(ch)) {
      if (digits >= maxDigits) {
        continue
      }
      digits += 1
    }
    out += ch
  }
  return out
}

function countMobileDigits(value: string): number {
  return [...value].filter((ch) => PHONE_INPUT_DIGIT.test(ch)).length
}

const schema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'لطفا شماره موبایل خود را وارد کنید')
    .regex(PhoneNumberRegExp, {
      message: 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود',
    }),
})

type InputForm = z.infer<typeof schema>

/* eslint-disable react-hooks/exhaustive-deps */

const PhoneNumberForm: FC = () => {
  const [loginState, setLoginState] = useAtom(loginStateAtom)
  const { mutate: generateOtp, isPending: isGeneratingOtp } = useGenerateOtp()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputForm>({
    resolver: zodResolver(schema),
  })

  const phoneNumberValue = watch('phoneNumber')
  const hasElevenDigits = countMobileDigits(phoneNumberValue ?? '') === 11

  const phoneField = register('phoneNumber')

  const onSubmit: SubmitHandler<InputForm> = (data) => {
    const normalizedPhone = englishDigits(data.phoneNumber)

    generateOtp(
      { data: { mobileNumber: normalizedPhone, scope: 'client' } },
      {
        onSuccess(response) {
          const ttl = response?.ttl ?? 0
          const resendTtl = response?.resendTtl ?? 0
          const now = Date.now()

          const expiresAt = ttl ? now + ttl * 1000 : 0
          const resendAvailableAt = resendTtl ? now + resendTtl * 1000 : 0

          setLoginState({
            expiresAt,
            resendAvailableAt,
            step: 'otp',
            phoneNumber: normalizedPhone,
            previousStep: 'phoneNumber',
          })

          toast.success('کد تایید با موفقیت ارسال شد')
        },
      },
    )
  }

  const ANIMATION_DELAY = useMemo(
    () => (loginState.previousStep === 'otp' ? 0 : 1000),
    [],
  )

  return (
    <form
      className="flex h-full flex-col px-5 pt-8 pb-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Animate animation="slideUp" delay={ANIMATION_DELAY}>
          <h1 className="typo-title-large text-text-primary">
            ورود به حساب کاربری
          </h1>
        </Animate>

        <Animate animation="slideUp" delay={ANIMATION_DELAY + 200}>
          <p className="typo-body-medium text-text-secondary">
            لطفا شماره موبایل خود را وارد کنید
          </p>
        </Animate>
      </div>

      <div className="mt-8">
        <Animate animation="slideUp" delay={ANIMATION_DELAY + 400}>
          <Input
            dir="ltr"
            inputMode="tel"
            end={<RiPhoneFill />}
            placeholder="09123456789"
            {...phoneField}
            onChange={(e) => {
              const capped = capMobileDigitInput(e.currentTarget.value, 11)
              if (capped !== e.currentTarget.value) {
                e.currentTarget.value = capped
              }
              void phoneField.onChange(e)
            }}
            helperText={
              errors.phoneNumber
                ? errors.phoneNumber.message
                : 'مثال: 09123456789'
            }
            error={!!errors.phoneNumber}
          />
        </Animate>
      </div>

      <Animate
        animation="slideUp"
        delay={ANIMATION_DELAY + 600}
        className="mt-auto w-full"
      >
        <Button
          type="submit"
          size="large"
          loading={isGeneratingOtp}
          disabled={!hasElevenDigits || isGeneratingOtp}
          className="w-full"
        >
          ارسال کد ورود
        </Button>
      </Animate>
    </form>
  )
}

export default PhoneNumberForm
