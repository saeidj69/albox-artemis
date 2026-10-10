import { FC } from 'react'

import Image from 'next/image'

import { Logout, Refresh } from 'iconsax-reactjs'

import MovingGradient from '@/components/MovingGradient'

import AspectRatio from '@/lib/AspectRatio'
import Button from '@/lib/Button'

type ProtectedErrorProps = {
  onLogout: () => void
  isLoggingOut?: boolean
}

const ProtectedError: FC<ProtectedErrorProps> = (props) => {
  const { onLogout, isLoggingOut } = props

  return (
    <MovingGradient className="bg-primary-600 fixed inset-0 h-dvh w-dvw">
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 px-4">
        <div className="w-37.5">
          <AspectRatio ratio={161 / 43}>
            <Image
              fill
              alt="logo"
              sizes="150px"
              loading="eager"
              src="/images/logo-type-white.svg"
            />
          </AspectRatio>
        </div>

        <div className="typo-label-large text-white">
          خطا در دریافت حساب کاربری
        </div>

        <div className="grid w-full max-w-md grid-cols-1 gap-4">
          <Button
            size="medium"
            variant="secondary"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            تلاش مجدد
          </Button>

          <Button
            size="medium"
            variant="destructive"
            startIcon={<Logout />}
            loading={isLoggingOut}
            onClick={onLogout}
          >
            خروج از حساب
          </Button>
        </div>
      </div>
    </MovingGradient>
  )
}

export default ProtectedError
