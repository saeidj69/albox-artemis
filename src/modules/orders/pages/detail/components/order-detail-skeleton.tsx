import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import Skeleton from '@/lib/Skeleton'

const SectionBand = () => (
  <div className="bg-border-lighter -mx-4 mt-4 mb-3 h-1.5 shrink-0" />
)

const InfoRowsSkeleton = ({ rows }: { rows: number }) => (
  <div className="flex flex-col gap-1">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between py-0.5">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    ))}
  </div>
)

const OrderDetailSkeleton = () => {
  return (
    <>
      <Layout.Header height={64}>
        <Header right={<HeaderBackButton />} center="جزئیات سفارش" />
      </Layout.Header>

      <main className="w-app flex flex-col py-4">
        <div className="flex flex-col gap-3">
          {/* Address + time */}
          <div className="grid gap-1.5">
            <div className="flex items-center gap-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </div>

          {/* Status indicator card */}
          <div className="border-border-main flex flex-col gap-3 rounded-md border px-3 py-2">
            <div className="flex items-center justify-between pb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="size-8 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>

          {/* Order info */}
          <InfoRowsSkeleton rows={3} />
        </div>

        <SectionBand />

        {/* Products */}
        <div className="divide-border-lighter flex flex-col divide-y">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-1 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
              <Skeleton className="rounded-brand size-20 shrink-0" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer (summary + buttons) */}
      <Layout.Footer height={220} className="bg-background-main shadow-sm">
        <div className="border-border-lighter border-t-[6px]">
          <div className="px-4 pt-3">
            <InfoRowsSkeleton rows={5} />
          </div>
          <div className="flex gap-3 px-4 pt-3 pb-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </Layout.Footer>
    </>
  )
}

export default OrderDetailSkeleton
