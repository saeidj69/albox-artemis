'use client'

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react'

import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { TabContext, useTabContext } from './context'
import type {
  TabContentProps,
  TabListProps,
  TabRootProps,
  TabTriggerProps,
} from './types'
import { tabVariants } from './variants'

const TabRootComponent = (props: TabRootProps) => {
  const {
    className,
    classNames,
    ref,
    size = 'medium',
    onChange,
    onValueChange,
    ...otherProps
  } = props
  const slots = tabVariants({ size })

  return (
    <TabContext.Provider value={{ size }}>
      <TabsPrimitive.Root
        ref={ref}
        data-slot="tab"
        data-size={size}
        className={cn(slots.root({ className }), classNames?.root)}
        onValueChange={(value) => {
          onValueChange?.(value)
          onChange?.(value)
        }}
        {...otherProps}
      />
    </TabContext.Provider>
  )
}

type IndicatorStyle = {
  width: number
  x: number
}

const TabListComponent = (props: TabListProps) => {
  const { className, classNames, ref, children, ...otherProps } = props
  const { size } = useTabContext()
  const slots = tabVariants({ size })
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<IndicatorStyle | null>(null)
  const [ready, setReady] = useState(false)
  const frameRef = useRef(0)
  const measuredRef = useRef(false)

  const updateIndicator = useCallback(() => {
    cancelAnimationFrame(frameRef.current)

    frameRef.current = requestAnimationFrame(() => {
      const list = listRef.current
      if (!list) return

      const activeTrigger = list.querySelector<HTMLElement>(
        '[data-slot="tab-trigger"][data-state="active"]',
      )
      if (!activeTrigger) {
        setIndicator(null)
        return
      }

      const next = {
        x: activeTrigger.offsetLeft,
        width: activeTrigger.offsetWidth,
      }

      setIndicator((prev) => {
        if (prev && prev.x === next.x && prev.width === next.width) return prev
        return next
      })

      if (!measuredRef.current) {
        measuredRef.current = true
        requestAnimationFrame(() => setReady(true))
      }
    })
  }, [])

  useLayoutEffect(() => {
    updateIndicator()

    const list = listRef.current
    if (!list) return

    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(list)

    const observeTriggers = () => {
      list.querySelectorAll('[data-slot="tab-trigger"]').forEach((trigger) => {
        resizeObserver.observe(trigger)
      })
    }
    observeTriggers()

    const mutationObserver = new MutationObserver(() => {
      observeTriggers()
      updateIndicator()
    })
    mutationObserver.observe(list, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['data-state'],
    })

    window.addEventListener('resize', updateIndicator)

    return () => {
      cancelAnimationFrame(frameRef.current)
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [updateIndicator])

  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node

      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as { current: HTMLDivElement | null }).current = node
      }

      if (node) updateIndicator()
    },
    [ref, updateIndicator],
  )

  const indicatorStyle: CSSProperties | undefined =
    indicator != null
      ? {
          width: indicator.width,
          transform: `translate3d(${indicator.x}px, 0, 0)`,
          transition: ready
            ? 'transform var(--animate-duration-fast) ease-out, width var(--animate-duration-fast) ease-out'
            : 'none',
        }
      : undefined

  return (
    <TabsPrimitive.List
      ref={setListRef as Ref<HTMLDivElement>}
      data-slot="tab-list"
      className={cn(slots.list({ className }), classNames?.list)}
      {...otherProps}
    >
      {indicator != null && (
        <span
          data-slot="tab-indicator"
          aria-hidden
          className={cn(slots.indicator(), classNames?.indicator)}
          style={indicatorStyle}
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

const TabTriggerComponent = (props: TabTriggerProps) => {
  const { className, classNames, ref, children, ...otherProps } = props
  const { size } = useTabContext()
  const slots = tabVariants({ size })

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tab-trigger"
      className={cn(slots.trigger({ className }), classNames?.trigger)}
      {...otherProps}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

const TabContentComponent = (props: TabContentProps) => {
  const { className, classNames, ref, children, ...otherProps } = props
  const slots = tabVariants()

  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tab-content"
      className={cn(slots.content({ className }), classNames?.content)}
      {...otherProps}
    >
      {children}
    </TabsPrimitive.Content>
  )
}

export {
  TabContentComponent,
  TabListComponent,
  TabRootComponent,
  TabTriggerComponent,
}
