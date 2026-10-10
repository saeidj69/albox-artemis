'use client'

import { FC, useEffect, useMemo } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { EVENTS, track } from '@/helpers/analytics'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import Animate from '@/components/Animate'

import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'
import AuthLayout from '@/modules/authentication/layout'
import { iranianNationalCode } from '@/modules/authentication/utils/national-code'
import {
  clearRegistrationPending,
  getRegistrationPending,
} from '@/modules/authentication/utils/registration-storage'

import { englishDigits } from '@/utils/numbers'

import { useRegister } from '@/api/functions/auth'
import { getProfileQueryKey } from '@/api/functions/profile'
import type { RegisterBody } from '@/api/models'

import { queryClient } from '@/providers/ReactQuery'

import Button from '@/lib/Button'
import Checkbox from '@/lib/Checkbox'
import Input from '@/lib/Input'

const schema = z.object({
  firstName: z.string().trim().min(1, 'لطفا نام خود را وارد کنید'),
  lastName: z.string().trim().min(1, 'لطفا نام خانوادگی خود را وارد کنید'),
  nationalCode: iranianNationalCode(),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'باید با قوانین و مقررات موافقت کنید',
  }),
})

type InputForm = z.infer<typeof schema>

type RegisterBodyWithReferral = RegisterBody & { referralCode?: string }

const RegisterPage: FC = () => {
  const router = useRouter()
  const hasRegistrationPending = useMemo(
    () => Boolean(getRegistrationPending()),
    [],
  )

  const { mutate: register, isPending } = useRegister()

  useEffect(() => {
    if (!hasRegistrationPending) router.replace(ROUTES.AUTH.LOGIN)
  }, [hasRegistrationPending, router])

  const {
    register: registerField,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<InputForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      nationalCode: '',
      referralCode: '',
      agreeToTerms: false,
    },
  })

  const agreeToTerms = useWatch({
    control,
    name: 'agreeToTerms',
  })

  const onSubmit: SubmitHandler<InputForm> = (values) => {
    const data: RegisterBodyWithReferral = {
      firstName: values.firstName,
      lastName: values.lastName,
      nationalCode: englishDigits(values.nationalCode),
      ...(values.referralCode
        ? { referralCode: englishDigits(values.referralCode) }
        : {}),
    }

    register(
      { data: data as RegisterBody },
      {
        onSuccess({ profile }) {
          queryClient.removeQueries({ queryKey: getProfileQueryKey() })

          clearRegistrationPending()

          const gtm = {
            method: 'otp' as const,
            user_id: profile?.id ?? '',
            user_type: 'buyer' as const,
          }

          const webengage = {
            mode: 'otp' as const,
          }

          track(EVENTS.REGISTER, {
            gtm,
            webengage,
          })

          setTimeout(() => {
            router.replace(
              buildAddressCreateSelectLocationUrl({ canSkip: true }),
            )
          })
        },
      },
    )
  }

  const nationalCodeValue = useWatch({
    control,
    name: 'nationalCode',
  })

  const referralCodeValue = useWatch({
    control,
    name: 'referralCode',
  })

  if (!hasRegistrationPending) {
    return <AuthLayout topPanel="none">{null}</AuthLayout>
  }

  return (
    <AuthLayout topPanel="none">
      <form
        className="flex h-full flex-col p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Animate animation="slideUp">
            <h1 className="typo-title-large text-text-primary mb-2">
              تکمیل اطلاعات
            </h1>
          </Animate>

          <Animate animation="slideUp" delay={200}>
            <p className="typo-body-medium text-text-secondary">
              لطفا اطلاعات خود را تکمیل کنید
            </p>
          </Animate>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden overflow-y-auto">
          <Animate animation="slideUp" delay={300}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="نام"
                placeholder="نام"
                {...registerField('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <Input
                label="نام خانوادگی"
                placeholder="نام خانوادگی"
                {...registerField('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </div>
          </Animate>

          <Animate animation="slideUp" delay={400}>
            <Input
              dir={nationalCodeValue ? 'ltr' : 'rtl'}
              inputMode="numeric"
              label="کد ملی"
              placeholder="کد ملی"
              {...registerField('nationalCode', {
                setValueAs: (v: string) => englishDigits(v ?? ''),
              })}
              error={!!errors.nationalCode}
              helperText={errors.nationalCode?.message}
            />
          </Animate>

          <Animate animation="slideUp" delay={500}>
            <Input
              dir={referralCodeValue ? 'ltr' : 'rtl'}
              optional
              label="کد معرف"
              placeholder="کد معرف"
              {...registerField('referralCode', {
                setValueAs: (v: string) => englishDigits(v ?? ''),
              })}
              error={!!errors.referralCode}
              helperText={errors.referralCode?.message}
            />
          </Animate>
        </div>

        <div className="mt-auto flex w-full shrink-0 flex-col gap-4 pt-6">
          <Animate animation="slideUp" delay={600}>
            <label
              htmlFor="agreeToTerms"
              className="flex cursor-pointer items-start gap-2"
            >
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms === true}
                onCheckedChange={(checked) =>
                  setValue('agreeToTerms', checked === true, {
                    shouldValidate: true,
                  })
                }
              />
              <span className="typo-body-small text-text-primary leading-6">
                <a
                  href={ROUTES.PRIVACY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600"
                >
                  قوانین و مقررات
                </a>{' '}
                آل‌باکس را خوانده و موافقم
              </span>
            </label>
            {errors.agreeToTerms && (
              <div className="typo-body-small text-text-error mt-1">
                {errors.agreeToTerms.message}
              </div>
            )}
          </Animate>

          <Animate delay={700}>
            <Button
              type="submit"
              size="large"
              className="w-full"
              loading={isPending}
              disabled={!isValid}
            >
              ورود به آل‌باکس
            </Button>
          </Animate>
        </div>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
