'use client'

import { RiVerifiedBadgeLine } from '@remixicon/react'

import Animate from '@/components/Animate'
import SmartImage from '@/components/SmartImage'

import { useGetBrandListing } from '@/api/functions/catalogue'

type BrandInfoProps = {
  brandId: number
}

const BrandInfo = ({ brandId }: BrandInfoProps) => {
  const { data: brand, isLoading } = useGetBrandListing(brandId, {
    query: {
      select(data) {
        return data?.brand
      },
    },
  })

  if (isLoading) {
    return (
      <div className="rounded-brand bg-background-secondary flex gap-3 p-4">
        <div className="bg-border-main size-16 shrink-0 animate-pulse rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="bg-border-main h-5 w-1/3 animate-pulse rounded-lg" />
          <div className="bg-border-main h-4 w-full animate-pulse rounded-lg" />
          <div className="bg-border-main h-4 w-2/3 animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!brand) return null

  const logo = brand.images?.[0]

  const isBrandAnonymous = brand?.manufacturer?.name === 'نامشخص'

  return (
    <Animate animation="slideUp" delay={100}>
      <section className="rounded-brand bg-background-main border-border-lighter flex items-center gap-3 border p-4 shadow-sm">
        <div className="bg-background-secondary border-border-lighter flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
          {logo ? (
            <SmartImage
              fill
              media={logo}
              preferredSize="md"
              alt={brand.name}
              sizes="64px"
              classNames={{ image: 'object-contain' }}
            />
          ) : (
            <RiVerifiedBadgeLine className="text-border-darker size-8" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center space-y-1">
          <h1 className="typo-title-medium text-text-primary">{brand.name}</h1>

          {brand.description && (
            <p className="typo-body-small text-text-secondary leading-6">
              {brand.description}
            </p>
          )}

          {!isBrandAnonymous && brand?.manufacturer?.name && (
            <p className="typo-label-small text-text-secondary">
              سازنده: {brand.manufacturer.name}
            </p>
          )}
        </div>
      </section>
    </Animate>
  )
}

export default BrandInfo
