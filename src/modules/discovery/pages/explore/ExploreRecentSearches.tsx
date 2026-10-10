'use client'

import { type MouseEvent } from 'react'

import { RiCloseLine } from '@remixicon/react'

import ActionSheet from '@/components/ActionSheet'

import Chip from '@/lib/Chip'
import { hideSheet, showSheet } from '@/lib/Sheet'

import useSearchRecents from './hooks/use-search-recents'

export type ExploreRecentSearchesProps = {
  onSelectRecentQuery: (query: string) => void
}

const ExploreRecentSearches = (props: ExploreRecentSearchesProps) => {
  const { onSelectRecentQuery } = props

  const { recents, clearAllRecents, removeRecentAt } = useSearchRecents()

  if (!recents.length) {
    return null
  }

  return (
    <div className="w-app mt-4 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="typo-label-small text-text-primary">
          جست‌وجوهای اخیر
        </span>
        <button
          type="button"
          className="typo-body-small text-primary-600"
          onClick={() => {
            showSheet(ActionSheet, {
              title: 'حذف همه جست‌وجوهای اخیر',
              description:
                'آیا مطمئن هستید که می‌خواهید همه موارد اخیر پاک شوند؟',
              actions: [
                {
                  id: 'cancel',
                  variant: 'text',
                  children: 'انصراف',
                  className: 'w-full',
                  onClick: () => {
                    hideSheet(ActionSheet)
                  },
                },
                {
                  id: 'confirm',
                  variant: 'destructive',
                  children: 'بله پاک کن',
                  className: 'w-full',
                  onClick: () => {
                    clearAllRecents()
                    hideSheet(ActionSheet)
                  },
                },
              ],
            })
          }}
        >
          پاک کردن همه
        </button>
      </div>
      <ul className="flex flex-wrap gap-2 px-1">
        {recents.map((item, index) => (
          <li key={`${item}-${index}`}>
            <Chip
              content={item}
              onClick={() => onSelectRecentQuery(item)}
              variant="soft"
              className="min-w-14"
              end={
                <button
                  type="button"
                  aria-label="حذف از تاریخچه"
                  className="cursor-pointer rounded-full"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation()
                    removeRecentAt(index)
                  }}
                >
                  <RiCloseLine className="size-4" />
                </button>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ExploreRecentSearches
