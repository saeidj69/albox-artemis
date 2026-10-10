import { FC, memo } from 'react'

import { RiVerifiedBadgeLine } from '@remixicon/react'

import SmartImage from '@/components/SmartImage'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

import { BrandCardProps } from './types'
import { brandCardVariants } from './variants'

const BrandCardComponent: FC<BrandCardProps> = (props) => {
  const { brand, ref, className, classNames, ...otherProps } = props

  const slots = brandCardVariants()

  return (
    <article
      ref={ref}
      data-slot="brand-card"
      type="button"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      <div
        className={slots.imageContainer({
          className: classNames?.imageContainer,
        })}
      >
        <AspectRatio
          ratio={1}
          data-slot="brand-card-aspect-ratio"
          className={slots.aspectRatio({ className: classNames?.aspectRatio })}
        >
          {brand?.images?.[0] ? (
            <SmartImage
              fill
              sizes="30vw"
              alt={brand?.name ?? ''}
              media={brand.images[0]}
              preferredSize="md"
              classNames={{
                image: slots.image({ className: classNames?.image }),
              }}
            />
          ) : (
            <div className="grid size-full place-items-center">
              <RiVerifiedBadgeLine className="text-border-darker size-10" />
            </div>
          )}
        </AspectRatio>
      </div>

      <span
        data-slot="brand-card-title"
        className={slots.title({ className: classNames?.title })}
      >
        {brand.name}
      </span>
    </article>
  )
}

export default memo(BrandCardComponent)
