'use client'

import { useCallback, useImperativeHandle, useRef, type Ref } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import Animate from '@/components/Animate'
import SmartImage from '@/components/SmartImage'

import type { ListingCategory } from '@/api/models'

import Chip from '@/lib/Chip'
import { GridList } from '@/lib/GridList'

export type CategoryChipsGridListHandle = {
  scrollToIndex: (index: number) => void
}

type CategoryChipsGridListProps = {
  categories: ListingCategory[]
  isLoading: boolean
  categoryId: number
  ref?: Ref<CategoryChipsGridListHandle>
}

const CategoryChipsGridList = (props: CategoryChipsGridListProps) => {
  const { categories, isLoading, categoryId, ref } = props

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        const el = itemRefs.current[index]
        el?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      },
    }),
    [],
  )

  const setItemRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el
    }
  }, [])

  const renderItem = useCallback(
    (item: ListingCategory, index: number) => {
      const active = item.id === categoryId

      return (
        <div ref={setItemRef(index)} className="shrink-0">
          <Animate key={item.id} animation="slideUp" delay={index * 20}>
            <Chip
              as={Link}
              href={ROUTES.CATEGORIES.detail(item.id)}
              prefetch={false}
              content={item.name}
              variant={active ? 'secondary' : 'default'}
              className="shrink-0"
              size="large"
              start={
                <SmartImage
                  fill
                  className="size-6"
                  sizes="24px"
                  alt={item?.name ?? ''}
                  media={item?.images?.[0]}
                  preferredSize="xs"
                />
              }
            />
          </Animate>
        </div>
      )
    },
    [categoryId, setItemRef],
  )

  const renderSkeleton = useCallback((index: number) => {
    return (
      <Animate key={index} animation="slideUp" delay={index * 20}>
        <Chip.Skeleton size="medium" className="w-20 shrink-0" />
      </Animate>
    )
  }, [])

  return (
    <GridList
      rows={1}
      columns={3}
      fragment
      loading={isLoading}
      data={categories}
      renderItem={renderItem}
      renderSkeleton={renderSkeleton}
      skeletonCount={8}
      rowClassName="gap-2 px-4"
      columnClassName="gap-2"
    />
  )
}

export default CategoryChipsGridList
