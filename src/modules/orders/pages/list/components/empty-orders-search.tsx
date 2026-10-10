import Image from 'next/image'

const EmptyOrdersSearch = () => (
  <div className="flex flex-col items-center gap-6 py-16 text-center">
    <Image
      src="/images/empty-orders.png"
      alt=""
      width={160}
      height={160}
      preload
    />

    <div className="grid gap-2">
      <h2 className="typo-title-medium">سفارشی مطابق با فیلتر شما پیدا نشد.</h2>
      <p className="typo-body-medium text-text-secondary">
        شماره سفارش را بررسی کنید و دوباره تلاش کنید.
      </p>
    </div>
  </div>
)

export default EmptyOrdersSearch
