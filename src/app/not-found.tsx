import Link from 'next/link'

import { ROUTES } from '@/constants'

const NotFoundPage = () => {
  return (
    <div className="bg-background-main container flex min-h-dvh flex-col items-center justify-center gap-4 py-8 text-center">
      <h1 className="typo-title-large text-text-primary">404</h1>

      <h2 className="typo-title-medium text-text-primary">
        صفحه مورد نظر پیدا نشد
      </h2>

      <p className="typo-body-medium text-text-secondary">
        آدرس وارد شده وجود ندارد یا حذف شده است.
      </p>

      <Link
        href={ROUTES.HOME}
        className="bg-primary-600 text-text-inverse typo-label-medium rounded-full px-5 py-2"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  )
}

export default NotFoundPage
