'use client'

import { FC, memo, useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROUTES, TAB_ROOTS, type TabRoot } from '@/constants'
import {
  Category2,
  Home2,
  Verify,
  ReceiptText,
  Bag,
  Icon,
} from 'iconsax-reactjs'

import { useBasket } from '@/modules/purchase/hooks'

import { cn } from '@/lib/utils'

import Animate from '../Animate'
import { BottomNavigationProps } from './types'
import { bottomNavigationVariants } from './variants'

interface NavItem {
  title: string
  path: TabRoot
  icon: Icon
  isBasket?: boolean
}

const NAV_META: Record<TabRoot, Omit<NavItem, 'path'>> = {
  [ROUTES.HOME]: { title: 'صفحه‌اصلی', icon: Home2 },
  [ROUTES.BRANDS.ROOT]: { title: 'برندها', icon: Verify },
  [ROUTES.CATEGORIES.ROOT]: {
    title: 'دسته‌بندی‌ها',
    icon: Category2,
  },
  [ROUTES.ORDERS.ROOT]: { title: 'سفارش‌ها', icon: ReceiptText },
  [ROUTES.BASKET]: {
    title: 'سبد خرید',
    icon: Bag,
    isBasket: true,
  },
}

const navigationItems: NavItem[] = TAB_ROOTS.map((path) => ({
  path,
  ...NAV_META[path],
}))

type BasketIconProps = {
  icon: Icon
  classNames: BottomNavigationProps['classNames']
  slots: ReturnType<typeof bottomNavigationVariants>
}

const BasketIcon = ({ icon: Icon, classNames, slots }: BasketIconProps) => {
  const { totalQuantity: count } = useBasket()

  return (
    <div className={slots.iconWrapper({ className: classNames?.iconWrapper })}>
      <Icon className={slots.icon({ className: classNames?.icon })} />

      <Animate
        className={cn(
          slots.badge({ className: classNames?.badge }),
          count === 0 && 'hidden',
        )}
        animation="scaleIn"
        duration={100}
      >
        {count > 99 ? '99+' : count}
      </Animate>
    </div>
  )
}

type NavItemProps = {
  item: NavItem
  index: number
  isActive: boolean
  classNames: BottomNavigationProps['classNames']
  onSelect: (index: number) => void
}

const BottomNavItem = memo(
  ({ item, index, isActive, classNames, onSelect }: NavItemProps) => {
    const slots = bottomNavigationVariants()

    return (
      <Link
        passHref
        href={item.path}
        prefetch={false}
        onClick={() => onSelect(index)}
        className={cn(
          slots.item({ className: classNames?.item }),
          isActive && slots.active({ className: classNames?.active }),
        )}
        style={{ animationDelay: Math.abs(index - 2) * 100 + 'ms' }}
      >
        {item.isBasket ? (
          <BasketIcon icon={item.icon} classNames={classNames} slots={slots} />
        ) : (
          <item.icon className={slots.icon({ className: classNames?.icon })} />
        )}

        <span
          className={cn(
            slots.label({ className: classNames?.label }),
            isActive &&
              slots.activeLabel({ className: classNames?.activeLabel }),
          )}
        >
          {item.title}
        </span>
      </Link>
    )
  },
)

BottomNavItem.displayName = 'BottomNavItem'

const BottomNavigation: FC<BottomNavigationProps> = (props) => {
  const { className, classNames } = props

  const pathname = usePathname()
  const slots = bottomNavigationVariants()

  const [selectedIndex, setSelectedIndex] = useState(2)

  const activeIndex = navigationItems.findIndex(
    (item) => item.path === pathname,
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      setSelectedIndex(activeIndex)
    })
  }, [activeIndex])

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  return (
    <div className={cn(slots.root({ className: classNames?.root }), className)}>
      <div
        className={slots.indicator({ className: classNames?.indicator })}
        style={{
          transform: `translateX(-${selectedIndex * 100}%) scaleX(0.7)`,
        }}
      />

      {navigationItems.map((item, index) => (
        <BottomNavItem
          key={item.title}
          item={item}
          index={index}
          isActive={activeIndex === index}
          classNames={classNames}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}

export default BottomNavigation
