'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'

import Button from '@/lib/Button'

const BasketEmpty = () => {
  const router = useRouter()

  return (
    <div className="flex min-h-[calc(100dvh-256px)] flex-col items-center justify-center gap-6 text-center">
      <Image
        src="/images/emptyBasket.png"
        alt=""
        width={240}
        height={240}
        preload
      />

      <div className="grid gap-2">
        <h2 className="typo-title-small text-text-primary">
          محصولی در سبد خرید شما وجود ندارد.
        </h2>
        <p className="typo-body-small text-text-secondary">
          همین حالا اولین محصول خود را به سبد خریدتان اضافه کنید.
        </p>
      </div>

      <Button
        size="large"
        className="w-full"
        onClick={() => router.push(ROUTES.HOME)}
      >
        مشاهده محصولات
      </Button>
    </div>
  )
}

export default BasketEmpty
