'use client'

import { FC } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { ArrowLeft2 } from 'iconsax-reactjs'

import { VerificationStatus } from '@/api/models'

import Alert from '@/lib/Alert'

type NationalCodeVerificationWarningProps = {
  className?: string
  hasAction?: boolean
  verificationStatus: VerificationStatus | undefined
}

const NationalCodeVerificationWarning: FC<
  NationalCodeVerificationWarningProps
> = (props) => {
  const { hasAction, verificationStatus, className } = props

  const router = useRouter()

  if (
    verificationStatus !== VerificationStatus.pending &&
    verificationStatus !== VerificationStatus.rejected
  ) {
    return null
  }

  const isPending = verificationStatus === VerificationStatus.pending

  if (isPending) {
    return (
      <Alert
        variant="warning"
        className={className}
        title="در حال بررسی تطابق کد ملی و شماره موبایل"
      >
        تا دقایقی دیگر نتیجه بررسی مشخص می‌شود.
      </Alert>
    )
  }

  return (
    <Alert
      variant="error"
      className={className}
      actions={
        hasAction
          ? [
              {
                id: 'edit',
                variant: 'destructive-soft',
                children: 'اصلاح اطلاعات',
                endIcon: <ArrowLeft2 />,
                onClick: () => router.push(ROUTES.PROFILE.EDIT),
              },
            ]
          : undefined
      }
      title="عدم تطابق کد ملی و شماره موبایل"
    >
      کد ملی وارد شده نیاز به اصلاح دارد.
    </Alert>
  )
}

export default NationalCodeVerificationWarning
