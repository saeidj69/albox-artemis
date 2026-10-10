'use client'

import type { FC, ReactNode } from 'react'
import {
  useInView,
  type IntersectionOptions,
} from 'react-intersection-observer'

export type VisibilityTrackerProps = IntersectionOptions & {
  children: ReactNode
}

const VisibilityTracker: FC<VisibilityTrackerProps> = ({
  children,
  ...options
}) => {
  const { ref } = useInView(options)

  return <div ref={ref}>{children}</div>
}

export default VisibilityTracker
