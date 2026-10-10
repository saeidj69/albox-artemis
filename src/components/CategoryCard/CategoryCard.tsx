import { FC, memo } from 'react'

import SmartImage from '@/components/SmartImage'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

import { CategoryCardProps } from './types'
import { categoryCardVariants } from './variants'

const CategoryCardComponent: FC<CategoryCardProps> = (props) => {
  const { category, ref, className, classNames, ...otherProps } = props

  const slots = categoryCardVariants()

  return (
    <button
      ref={ref}
      data-slot="category-card"
      type="button"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      <AspectRatio
        data-slot="category-card-aspect-ratio"
        className={slots.aspectRatio({ className: classNames?.aspectRatio })}
      >
        <SmartImage
          fill
          sizes="30vw"
          alt={category?.name ?? ''}
          media={category?.images?.[0]}
          preferredSize="md"
          classNames={{
            image: slots.image({ className: classNames?.image }),
          }}
        />
      </AspectRatio>
      <span
        data-slot="category-card-title"
        className={slots.title({ className: classNames?.title })}
      >
        {category.name}
      </span>
    </button>
  )
}

export default memo(CategoryCardComponent)
