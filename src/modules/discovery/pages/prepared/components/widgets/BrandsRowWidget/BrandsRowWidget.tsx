'use client'

import { FC } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import { RiMoreLine } from '@remixicon/react'

import BrandCard from '@/components/BrandCard'

import type { ListingBrandsShowcaseHydratedWidget } from '@/api/models'

import AspectRatio from '@/lib/AspectRatio'
import { cn, readableTextClass, type ReadableTextColor } from '@/lib/utils'

const isInternalHref = (href: string | null | undefined): href is string =>
  !!href && href.startsWith('/') && !href.startsWith('//')

/** Grid holds 8 tiles (2 rows × 4): at most 7 brands + the "see more" tile. */
const MAX_VISIBLE_BRANDS = 7

interface BrandsRowWidgetProps {
  index: number
  widget: ListingBrandsShowcaseHydratedWidget
  /** Readable text color over the row band background; undefined = no band. */
  bandTextColor?: ReadableTextColor
}

const BrandsRowWidget: FC<BrandsRowWidgetProps> = (props) => {
  const { widget, bandTextColor } = props

  const { brands } = widget

  if (!brands.length) {
    return null
  }

  const moreHref = isInternalHref(widget.href)
    ? widget.href
    : ROUTES.BRANDS.ROOT

  const titleClass = readableTextClass(bandTextColor)

  const visibleBrands = brands.slice(0, MAX_VISIBLE_BRANDS)

  return (
    <section data-slot="prepared-brands-row">
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {visibleBrands.map((brand) => (
          <Link
            key={brand.id}
            data-slot="prepared-brand-item"
            href={ROUTES.BRANDS.detail(brand.id)}
            prefetch={false}
            className="block w-full min-w-0"
          >
            <BrandCard
              brand={brand}
              classNames={titleClass ? { title: titleClass } : undefined}
            />
          </Link>
        ))}

        <Link
          href={moreHref}
          className={cn(
            'flex min-w-0 flex-col items-center',
            'transition-all duration-200 hover:scale-105 active:scale-95',
            'border-border-main rounded-brand border p-2',
          )}
        >
          <div className="w-2/3">
            <AspectRatio ratio={1} className="grid place-items-center">
              <RiMoreLine className="text-secondary-500 size-10" />
            </AspectRatio>
          </div>

          <span
            className={cn('typo-body-x-small mt-1 text-center', titleClass)}
          >
            برند بیشتر
          </span>
        </Link>
      </div>
    </section>
  )
}

export default BrandsRowWidget
