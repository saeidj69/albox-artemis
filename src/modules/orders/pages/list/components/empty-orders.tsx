'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'

import Button from '@/lib/Button'

const EmptyOrders = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <Image
        src="/images/empty-orders.png"
        alt=""
        width={160}
        height={160}
        preload
      />

      <div className="grid gap-2">
        <h2 className="typo-title-medium">هنوز سفارشی ثبت نشده است.</h2>
        <p className="typo-body-medium text-text-secondary">
          همین حالا سفارش جدید خود را ثبت کنید
        </p>

        <p className="typo-body-medium text-text-secondary">
          یا برای آشنایی با نحوه ثبت سفارش و انتخاب روش پرداخت، ویدئوی آموزشی را
          مشاهده کنید.
        </p>
      </div>

      <div className="flex w-full gap-4">
        <Button
          size="large"
          className="w-full whitespace-nowrap"
          onClick={() => router.push(ROUTES.CATEGORIES.ROOT)}
        >
          ثبت اولین سفارش
        </Button>

        <Button
          size="large"
          variant="ghost"
          className="w-full"
          onClick={() => router.push(ROUTES.TUTORIAL)}
        >
          مشاهده ویدئو
        </Button>
      </div>
    </div>
  )
}

export default EmptyOrders
