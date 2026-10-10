'use client'

import { useEffect, useRef, useState } from 'react'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { FAQ_CATEGORIES } from '@/modules/faq/constants/faq-categories'

import Accordion from '@/lib/Accordian'
import Chip from '@/lib/Chip'
import FlatList from '@/lib/FlatList'
import { cn } from '@/lib/utils'

const categories = Object.values(FAQ_CATEGORIES)

const FaqPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id)
  const activeChipRef = useRef<HTMLButtonElement>(null)

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? categories[0]

  useEffect(() => {
    const node = activeChipRef.current
    if (!node) return
    node.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedCategoryId])

  return (
    <>
      <Layout.Header height={64}>
        <Header right={<HeaderBackButton />} center="سوالات پرتکرار" />
      </Layout.Header>

      <main className="w-app flex flex-col">
        <div className="border-border-lighter -mx-4 border-b">
          <FlatList
            itemKey="id"
            direction="horizontal"
            data={categories}
            className="scrollbar-none gap-2 px-4 py-3 [&::-webkit-scrollbar]:hidden"
            renderItem={(item) => {
              const isActive = selectedCategoryId === item.id
              return (
                <Chip
                  ref={isActive ? activeChipRef : undefined}
                  content={item.title}
                  size="large"
                  variant={isActive ? 'secondary' : 'default'}
                  className={cn(
                    'h-10 shrink-0 px-4',
                    isActive && 'border-primary-600',
                  )}
                  classNames={{
                    content: cn(
                      'typo-label-small whitespace-nowrap',
                      isActive && 'text-primary-700 font-semibold',
                    ),
                  }}
                  onClick={() => setSelectedCategoryId(item.id)}
                />
              )
            }}
          />
        </div>

        <Accordion
          key={selectedCategory.id}
          type="single"
          collapsible
          className="flex flex-col gap-3 py-4"
        >
          {selectedCategory.items.map((item) => (
            <Accordion.Item
              key={item.id}
              value={item.id}
              className="border-border-lighter bg-background-main overflow-hidden rounded-xl border"
              classNames={{ item: 'last:border-b' }}
            >
              <Accordion.Trigger
                classNames={{
                  trigger: 'typo-title-small',
                }}
              >
                {item.question}
              </Accordion.Trigger>
              <Accordion.Content>{item.answer}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </main>
    </>
  )
}

export default FaqPage
