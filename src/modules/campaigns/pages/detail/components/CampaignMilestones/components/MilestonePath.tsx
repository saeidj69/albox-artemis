/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import Image from 'next/image'

import {
  resolveSegmentProgressRatio,
  snapSegmentProgressPercent,
} from '@/modules/campaigns/utils/build-nmv-campaign-view'

const DASH_ARRAY = '12 12'
const LOGO_SIZE = 36
/** Pause before the logo starts traveling */
const LOGO_TRAVEL_DELAY_MS = 700
/** Base travel time for a full path run (scaled by progress fraction) */
const LOGO_TRAVEL_MS_FULL = 6600
const LOGO_TRAVEL_MS_MIN = 2700
/** Keep logo hidden near a milestone until this fraction into / out of the segment. */
const LOGO_HIDE_NEAR_STEP_RATIO = 0.05

/**
 * Design curve control points as fractions along start→end
 * (from SVG: M277 74 C214.5 12, 121.5 64, 66 51 C10.5 38, 1.5 1.5, 1.5 1.5).
 */
const CURVE_C1 = { tx: 0.227, ty: 0.855 } as const
const CURVE_C2 = { tx: 0.564, ty: 0.138 } as const
const CURVE_MID = { tx: 0.766, ty: 0.317 } as const
const CURVE_C3 = { tx: 0.967, ty: 0.497 } as const

export type StepAnchor = {
  x: number
  top: number
  bottom: number
}

type LogoPoint = {
  x: number
  y: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Design S-curve: dual cubic matching the milestone path SVG
 * (right→left / left→right adapts via from/to X).
 */
export const buildCurvePath = (from: StepAnchor, to: StepAnchor) => {
  const x0 = from.x
  const y0 = from.bottom
  const x1 = to.x
  const y1 = to.top

  const pt = (tx: number, ty: number) =>
    `${lerp(x0, x1, tx)} ${lerp(y0, y1, ty)}`

  return `M ${x0} ${y0} C ${pt(CURVE_C1.tx, CURVE_C1.ty)}, ${pt(CURVE_C2.tx, CURVE_C2.ty)}, ${pt(CURVE_MID.tx, CURVE_MID.ty)} C ${pt(CURVE_C3.tx, CURVE_C3.ty)}, ${pt(1, 1)}, ${pt(1, 1)}`
}

/** Snap 0..1 progress down to the nearest 5% batch. */
export const snapSegmentProgressBatch = (ratio: number) =>
  snapSegmentProgressPercent(ratio * 100) / 100

export { resolveSegmentProgressRatio }

/**
 * Map delivered NMV onto path length using step targets as waypoints.
 * Segment i sits between stepTargets[i] and stepTargets[i + 1].
 */
export const resolveTargetPathLength = (input: {
  segmentLengths: number[]
  stepTargets: number[]
  certainProgress: number
}) => {
  const { segmentLengths, stepTargets, certainProgress } = input
  if (segmentLengths.length === 0) {
    return 0
  }

  let length = 0

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const fromTarget = stepTargets[index] ?? 0
    const toTarget = stepTargets[index + 1] ?? fromTarget
    const ratio = resolveSegmentProgressRatio(
      fromTarget,
      toTarget,
      certainProgress,
    )
    length += (segmentLengths[index] ?? 0) * ratio
  }

  return length
}

export const resolveTravelDurationMs = (input: {
  targetLength: number
  totalLength: number
}) => {
  const { targetLength, totalLength } = input
  if (totalLength <= 0 || targetLength <= 0) {
    return LOGO_TRAVEL_MS_MIN
  }

  const ratio = Math.min(1, targetLength / totalLength)

  return Math.max(LOGO_TRAVEL_MS_MIN, Math.round(ratio * LOGO_TRAVEL_MS_FULL))
}

/** True when delivered NMV has reached (or passed) the final milestone target. */
export const isMilestoneProgressComplete = (input: {
  stepTargets: number[]
  certainProgress: number
}) => {
  const { stepTargets, certainProgress } = input
  if (stepTargets.length === 0) {
    return false
  }

  const lastTarget = stepTargets[stepTargets.length - 1] ?? 0
  return certainProgress >= lastTarget
}

/**
 * Hide the logo while it is close to a step — first/last
 * `LOGO_HIDE_NEAR_STEP_RATIO` of each segment (start leave + end approach).
 * Also covers the initial “wait until 5% past step 0” rule.
 */
export const resolveLogoVisibilityLength = (input: {
  length: number
  segmentLengths: number[]
}) => {
  const { length, segmentLengths } = input
  if (length <= 0 || segmentLengths.length === 0) {
    return null
  }

  let remaining = length

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index] ?? 0
    if (segmentLength <= 0) {
      continue
    }

    const isLastSegment = index === segmentLengths.length - 1
    if (remaining > segmentLength && !isLastSegment) {
      remaining -= segmentLength
      continue
    }

    const ratioInSegment = Math.min(1, remaining / segmentLength)

    // Near the segment start (just left / still at previous step)
    // or near the segment end (approaching the next step).
    if (
      ratioInSegment <= LOGO_HIDE_NEAR_STEP_RATIO ||
      ratioInSegment >= 1 - LOGO_HIDE_NEAR_STEP_RATIO
    ) {
      return null
    }

    return length
  }

  return null
}

/**
 * Highest step index the logo/progress has reached.
 * Step i sits at the start of segment i (path distance = sum of prior segments).
 */
export const resolvePassedStepIndex = (input: {
  animatedLength: number
  segmentLengths: number[]
  stepCount: number
}) => {
  const { animatedLength, segmentLengths, stepCount } = input
  if (stepCount <= 0) {
    return -1
  }

  let passed = 0
  let distanceToStep = 0

  for (let index = 1; index < stepCount; index += 1) {
    distanceToStep += segmentLengths[index - 1] ?? 0
    if (animatedLength + 0.5 >= distanceToStep) {
      passed = index
    } else {
      break
    }
  }

  return passed
}

export const useMilestonePaths = (stepCount: number) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [paths, setPaths] = useState<string[]>([])

  const registerStep = useCallback(
    (index: number, node: HTMLDivElement | null) => {
      stepRefs.current[index] = node
    },
    [],
  )

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || stepCount < 1) {
      setPaths([])
      return
    }

    const update = () => {
      const containerRect = container.getBoundingClientRect()
      const anchors: StepAnchor[] = []

      for (let index = 0; index < stepCount; index += 1) {
        const node = stepRefs.current[index]
        if (!node) {
          continue
        }

        const rect = node.getBoundingClientRect()
        anchors.push({
          x: rect.left + rect.width / 2 - containerRect.left,
          top: rect.top - containerRect.top,
          bottom: rect.bottom - containerRect.top,
        })
      }

      if (anchors.length === 0) {
        setPaths([])
        return
      }

      const nextPaths: string[] = []
      for (let index = 0; index < anchors.length - 1; index += 1) {
        nextPaths.push(buildCurvePath(anchors[index]!, anchors[index + 1]!))
      }

      setPaths(nextPaths)
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(container)
    stepRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [stepCount])

  return { containerRef, registerStep, paths }
}

type MilestonePathProps = {
  paths: string[]
  stepCount: number
  stepTargets: number[]
  certainProgress: number
  onPassedStepIndexChange?: (index: number) => void
}

export const MilestonePath = (props: MilestonePathProps) => {
  const {
    paths,
    stepCount,
    stepTargets,
    certainProgress,
    onPassedStepIndexChange,
  } = props
  const rawMaskId = useId()
  const maskId = `milestone-progress-${rawMaskId.replace(/:/g, '')}`
  const measureRefs = useRef<(SVGPathElement | null)[]>([])
  const onPassedRef = useRef(onPassedStepIndexChange)
  useEffect(() => {
    onPassedRef.current = onPassedStepIndexChange
  }, [onPassedStepIndexChange])
  const [segmentLengths, setSegmentLengths] = useState<number[]>([])
  const [logoPoint, setLogoPoint] = useState<LogoPoint | null>(null)
  const [animatedLength, setAnimatedLength] = useState(0)

  useLayoutEffect(() => {
    const lengths = paths.map((_, index) => {
      const node = measureRefs.current[index]
      return node?.getTotalLength() ?? 0
    })
    setSegmentLengths(lengths)
  }, [paths])

  useEffect(() => {
    if (paths.length === 0 || segmentLengths.length !== paths.length) {
      setLogoPoint(null)
      setAnimatedLength(0)
      onPassedRef.current?.(-1)
      return
    }

    const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0)
    if (totalLength <= 0) {
      setLogoPoint(null)
      setAnimatedLength(0)
      onPassedRef.current?.(-1)
      return
    }

    const targetLength = resolveTargetPathLength({
      segmentLengths,
      stepTargets,
      certainProgress,
    })
    const durationMs = resolveTravelDurationMs({
      targetLength,
      totalLength,
    })
    const hideLogoAtEnd = isMilestoneProgressComplete({
      stepTargets,
      certainProgress,
    })

    const pointAt = (distance: number): LogoPoint | null => {
      const visibleLength = resolveLogoVisibilityLength({
        length: distance,
        segmentLengths,
      })
      if (visibleLength == null) {
        return null
      }

      let remaining = visibleLength

      for (let index = 0; index < paths.length; index += 1) {
        const length = segmentLengths[index] ?? 0
        const node = measureRefs.current[index]
        if (!node || length <= 0) {
          continue
        }

        if (remaining <= length || index === paths.length - 1) {
          const point = node.getPointAtLength(Math.min(remaining, length))
          return { x: point.x, y: point.y }
        }

        remaining -= length
      }

      return null
    }

    let frameId = 0
    let lastPassed = 0
    setAnimatedLength(0)
    setLogoPoint(null)
    onPassedRef.current?.(0)

    const tick = (now: number, start: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const length = targetLength * t
      setAnimatedLength(length)

      const passed = resolvePassedStepIndex({
        animatedLength: length,
        segmentLengths,
        stepCount,
      })
      if (passed !== lastPassed) {
        lastPassed = passed
        onPassedRef.current?.(passed)
      }

      if (t < 1) {
        setLogoPoint(pointAt(length))
        frameId = requestAnimationFrame((next) => tick(next, start))
        return
      }

      // Finished campaign: drop the logo once it reaches the last milestone
      if (hideLogoAtEnd) {
        setLogoPoint(null)
        onPassedRef.current?.(stepCount - 1)
        return
      }

      setLogoPoint(pointAt(length))
    }

    const delayId = window.setTimeout(() => {
      const start = performance.now()
      frameId = requestAnimationFrame((now) => tick(now, start))
    }, LOGO_TRAVEL_DELAY_MS)

    return () => {
      window.clearTimeout(delayId)
      cancelAnimationFrame(frameId)
    }
  }, [certainProgress, paths, segmentLengths, stepCount, stepTargets])

  if (paths.length === 0) {
    return null
  }

  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0)
  const progressLength = animatedLength

  return (
    <div
      data-slot="campaign-milestones-path"
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      aria-hidden
    >
      <svg className="absolute inset-0 size-full overflow-visible">
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="black" />
            {totalLength > 0
              ? paths.map((d, index) => {
                  const length = segmentLengths[index] ?? 0
                  if (length <= 0) {
                    return null
                  }

                  const start = segmentLengths
                    .slice(0, index)
                    .reduce((sum, value) => sum + value, 0)
                  const visible = Math.max(
                    0,
                    Math.min(length, progressLength - start),
                  )

                  if (visible <= 0) {
                    return null
                  }

                  return (
                    <path
                      key={`mask-${index}`}
                      d={d}
                      fill="none"
                      stroke="white"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={`${visible} ${length}`}
                    />
                  )
                })
              : null}
          </mask>
        </defs>

        {paths.map((d, index) => (
          <path
            key={`track-${index}`}
            ref={(node) => {
              measureRefs.current[index] = node
            }}
            d={d}
            fill="none"
            stroke="var(--color-primary-50)"
            strokeWidth={2}
            strokeDasharray={DASH_ARRAY}
            strokeLinecap="round"
          />
        ))}

        {paths.map((d, index) => (
          <path
            key={`progress-${index}`}
            d={d}
            fill="none"
            stroke="var(--color-primary-600)"
            strokeWidth={2}
            strokeDasharray={DASH_ARRAY}
            strokeLinecap="round"
            mask={`url(#${maskId})`}
          />
        ))}
      </svg>

      {logoPoint ? (
        <div
          className="absolute z-[1] size-9 -translate-x-1/2 -translate-y-1/2"
          style={{ left: logoPoint.x, top: logoPoint.y }}
        >
          <Image
            src="/images/logo.svg"
            alt=""
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="bg-background-main p-1.5"
            priority
          />
        </div>
      ) : null}
    </div>
  )
}

export const resolveMilestoneProgress = (
  input: {
    isCurrent: boolean
    isAchieved: boolean
  }[],
) => {
  if (input.length === 0) {
    return 0
  }

  const currentIndex = input.findIndex((item) => item.isCurrent)
  if (currentIndex >= 0) {
    return currentIndex
  }

  let lastAchieved = 0
  input.forEach((item, index) => {
    if (item.isAchieved) {
      lastAchieved = index
    }
  })

  return lastAchieved
}
