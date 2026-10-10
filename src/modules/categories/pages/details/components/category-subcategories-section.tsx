'use client'

import { useCallback } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import Animate from '@/components/Animate'

import type { ListingCategory } from '@/api/models'

import Chip from '@/lib/Chip'
import { GridList } from '@/lib/GridList'

import { findTopLevelCategoryForRoute } from './category-tree-helpers'

type CategorySubcategoriesSectionProps = {
  categories: ListingCategory[]
  categoryId: number
  isLoading: boolean
}

const CategorySubcategoriesSection = (
  props: CategorySubcategoriesSectionProps,
) => {
  const { categories, categoryId, isLoading } = props

  const topLevel = findTopLevelCategoryForRoute(categories, categoryId)
  const subcategories = topLevel?.children ?? []

  const renderItem = useCallback(
    (item: ListingCategory, index: number) => {
      const active = item.id === categoryId

      return (
        <Animate key={item.id} animation="slideUp" delay={index * 20}>
          <Chip
            as={Link}
            href={ROUTES.CATEGORIES.detail(item.id)}
            prefetch={false}
            content={item.name}
            variant={active ? 'primary' : 'default'}
            className="shrink-0"
            size="medium"
          />
        </Animate>
      )
    },
    [categoryId],
  )

  const renderSkeleton = useCallback((index: number) => {
    return (
      <Animate key={index} animation="slideUp" delay={index * 20}>
        <Chip.Skeleton size="small" className="w-16 shrink-0" />
      </Animate>
    )
  }, [])

  if (!isLoading && subcategories.length === 0) {
    return null
  }

  return (
    <section
      className="border-border-main border-t pt-3"
      aria-label="زیردسته‌ها"
    >
      <div className="typo-body-small text-text-secondary mb-2 px-4">
        زیردسته‌ها
      </div>
      <GridList
        rows={1}
        columns={3}
        fragment
        loading={isLoading}
        data={subcategories}
        renderItem={renderItem}
        renderSkeleton={renderSkeleton}
        skeletonCount={6}
        rowClassName="gap-2 px-4"
        columnClassName="gap-2"
      />
    </section>
  )
}

export default CategorySubcategoriesSection
