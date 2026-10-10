'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiUserLine } from '@remixicon/react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'
import NationalCodeVerificationWarning from '@/components/NationalCodeVerificationWarning'

import { iranianNationalCode } from '@/modules/authentication/utils/national-code'

import { englishDigits } from '@/utils/numbers'

import {
  getProfileQueryKey,
  useProfile,
  useUpdateProfile,
} from '@/api/functions/profile'
import { VerificationStatus } from '@/api/models'

import Button from '@/lib/Button'
import Input from '@/lib/Input'

const baseSchema = {
  firstName: z.string().min(1, 'لطفا نام را وارد کنید'),
  lastName: z.string().min(1, 'لطفا نام خانوادگی را وارد کنید'),
}

const buildSchema = (isNationalCodeEditable: boolean) =>
  z.object({
    ...baseSchema,
    nationalCode: isNationalCodeEditable
      ? iranianNationalCode('کد ملی وارد شده معتبر نیست')
      : z.string().optional().or(z.literal('')),
  })

type FormValues = z.infer<ReturnType<typeof buildSchema>>

function formatMobileDisplay(mobile: string | undefined) {
  if (!mobile) return ''
  return mobile.replace('+98', '0')
}

const EditProfilePage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: profileData } = useProfile()
  const user = profileData?.profile
  const verificationStatus = user?.nationalCodeVerificationStatus?.value
  const isNationalCodeEditable =
    verificationStatus === VerificationStatus.rejected

  const { mutate: updateProfile, isPending } = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getProfileQueryKey() })
        toast.success('اطلاعات با موفقیت ذخیره شد.')
        router.back()
      },
      onError: () => {
        toast.error('خطا در به‌روزرسانی اطلاعات. لطفا دوباره تلاش کنید.')
      },
    },
  })

  const schema = useMemo(
    () => buildSchema(isNationalCodeEditable),
    [isNationalCodeEditable],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nationalCode: '',
    },
  })

  useEffect(() => {
    if (!user) return
    const nationalCode = user.nationalCode ?? ''
    const isMasked = nationalCode.includes('*')
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      nationalCode: isNationalCodeEditable && isMasked ? '' : nationalCode,
    })
  }, [
    user?.firstName,
    user?.lastName,
    user?.nationalCode,
    isNationalCodeEditable,
    reset,
  ])

  const onSubmit = (data: FormValues) => {
    const payload: {
      firstName: string
      lastName: string
      nationalCode?: string
    } = {
      firstName: data.firstName,
      lastName: data.lastName,
    }
    if (isNationalCodeEditable && data.nationalCode) {
      payload.nationalCode = englishDigits(data.nationalCode)
    }
    updateProfile({ data: payload })
  }

  const submitLabel = isNationalCodeEditable
    ? 'اصلاح اطلاعات'
    : 'ویرایش اطلاعات'

  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo />}
          right={<HeaderBackButton />}
          center="ویرایش پروفایل"
        />
      </Layout.Header>

      <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
        <main className="space-y-4 py-4">
          <NationalCodeVerificationWarning
            verificationStatus={verificationStatus}
          />

          <div className="bg-secondary-100 mx-auto mt-4 grid size-20 place-items-center rounded-full">
            <RiUserLine className="text-text-primary h-12 w-12" size={48} />
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            <Input
              label="نام"
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />

            <Input
              label="نام خانوادگی"
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </div>

          <Input
            dir="ltr"
            disabled={!isNationalCodeEditable}
            label="کد ملی"
            {...register('nationalCode', {
              setValueAs: (v: string | undefined) => (v ? englishDigits(v) : v),
            })}
            error={!!errors.nationalCode}
            helperText={errors.nationalCode?.message}
          />

          <Input
            disabled
            dir="ltr"
            label="شماره موبایل"
            value={formatMobileDisplay(user?.mobileNumber)}
          />
        </main>
      </form>

      <Layout.Footer height={80} className="bg-background-main shadow-sm">
        <div className="p-4">
          <Button
            type="submit"
            form="edit-profile-form"
            size="large"
            loading={isPending}
            disabled={!isDirty}
            className="w-full"
          >
            {submitLabel}
          </Button>
        </div>
      </Layout.Footer>
    </>
  )
}

export default EditProfilePage
