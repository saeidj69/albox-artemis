'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import SmartImage from '@/components/SmartImage'

import { useGetCategoryTree } from '@/api/functions/catalogue'
import type { ListingCategory } from '@/api/models'

import Chip from '@/lib/Chip'
import { GridList } from '@/lib/GridList'
import { cn } from '@/lib/utils/cn'

import { findTopLevelCategoryForRoute } from './category-tree-helpers'

type CategoriesTabsRowProps = {
  categoryId: number
  className?: string
  classNames?: Partial<{
    root: string
    chip: string
    chipStart: string
    chipContent: string
    image: string
  }>
}

const CategoriesTabsRow = (props: CategoriesTabsRowProps) => {
  const { categoryId, className, classNames } = props

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const { data: categories, isLoading } = useGetCategoryTree({
    query: {
      select(data) {
        return data?.categories ?? []
      },
    },
  })

  const list = useMemo(() => categories ?? [], [categories])

  const activeTopLevelId = useMemo(() => {
    const top = findTopLevelCategoryForRoute(list, categoryId)
    return top?.id ?? null
  }, [list, categoryId])

  const setItemRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el
    }
  }, [])

  useEffect(() => {
    if (isLoading || !list.length || activeTopLevelId == null) return

    const index = list.findIndex((c) => c.id === activeTopLevelId)
    if (index < 0) return

    const frame = requestAnimationFrame(() => {
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [activeTopLevelId, isLoading, list])

  const renderItem = useCallback(
    (item: ListingCategory, index: number) => {
      const active = item.id === activeTopLevelId

      return (
        <div ref={setItemRef(index)} className="shrink-0">
          <Chip
            as={Link}
            href={ROUTES.CATEGORIES.detail(item.id)}
            prefetch={false}
            content={item.name}
            variant={active ? 'secondary' : 'default'}
            size="large"
            className={cn('shrink-0', classNames?.chip)}
            classNames={{
              start: classNames?.chipStart,
              content: classNames?.chipContent,
            }}
            start={
              item?.images?.[0] ? (
                <SmartImage
                  fill
                  className="size-6"
                  sizes="24px"
                  alt={item?.name ?? ''}
                  media={item.images[0]}
                  preferredSize="xs"
                  classNames={{
                    image: cn('rounded-full object-cover', classNames?.image),
                  }}
                />
              ) : null
            }
          />
        </div>
      )
    },
    [activeTopLevelId, classNames, setItemRef],
  )

  const renderSkeleton = useCallback(() => {
    return <Chip.Skeleton size="large" className="w-24 shrink-0" />
  }, [])

  return (
    <div
      data-slot="categories-tabs-row"
      className={cn(className, classNames?.root)}
    >
      <GridList
        rows={1}
        columns={3}
        fragment
        loading={isLoading}
        data={list}
        renderItem={renderItem}
        renderSkeleton={renderSkeleton}
        skeletonCount={8}
        rowClassName="gap-2 px-4 py-3"
        columnClassName="gap-2"
      />
    </div>
  )
}

export default CategoriesTabsRow
