import { formatPrice, toTomanPrice } from '@/utils/numbers'

export type NmvViewStepInput = {
  id: number
  position: number
  certainProgress: number
  target: number
  effectiveAchieved: boolean
  progressionLocked?: boolean
  percentage: number | null
}

export type NmvTrackStepView = {
  id: number
  isActive: boolean
  isCurrent: boolean
  segmentProgress: number
  enableAnimation: boolean
}

export type NmvTrackWindow = {
  start: number
  end: number
  leadingDotCount: number
  trailingDotCount: number
}

export type NmvCopyPiece = {
  text: string
  emphasis?: boolean
}

export type NmvCampaignView = {
  title: string
  remainingCopy: NmvCopyPiece[] | null
  trackSteps: NmvTrackStepView[]
  leadingDotCount: number
  trailingDotCount: number
}

/** Visible milestone nodes in the track window. */
export const VISIBLE_STEP_COUNT = 4
/** Fixed overflow indicator count when total exceeds the window. */
export const EDGE_DOT_COUNT = 3

export const resolveNmvTrackWindow = (
  stepCount: number,
  currentIndex: number,
): NmvTrackWindow => {
  if (stepCount <= 0) {
    return { start: 0, end: 0, leadingDotCount: 0, trailingDotCount: 0 }
  }

  if (stepCount <= VISIBLE_STEP_COUNT) {
    return {
      start: 0,
      end: stepCount,
      leadingDotCount: 0,
      trailingDotCount: 0,
    }
  }

  const safeCurrent = Math.min(Math.max(currentIndex, 0), stepCount - 1)
  const start = Math.min(
    Math.max(0, safeCurrent - 1),
    Math.max(0, stepCount - VISIBLE_STEP_COUNT),
  )
  const end = Math.min(stepCount, start + VISIBLE_STEP_COUNT)

  return {
    start,
    end,
    leadingDotCount: start > 0 ? EDGE_DOT_COUNT : 0,
    trailingDotCount: end < stepCount ? EDGE_DOT_COUNT : 0,
  }
}

const GIFT_CREDIT_LABEL = 'اعتبار هدیه'
const ZERO_PROGRESS_COPY_PREFIX = 'با هر سفارش موفق، یک قدم به '
const ZERO_PROGRESS_COPY_SUFFIX = ' نزدیک‌تر شو.'
const ACHIEVED_COPY = 'تبریک! پس از اتمام دوره، اعتبار هدیه شما فعال می‌شود.'
const RECEIVED_TITLE_SUFFIX = 'دریافت کردید'

export const readGiftPercentage = (
  source: { [key: string]: unknown } | null | undefined,
): number | null => {
  if (!source) {
    return null
  }

  const value = source.percentage

  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null
}

export const formatGiftPercentageAmount = (fraction: number) =>
  (fraction * 100).toLocaleString('fa-IR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })

export const formatGiftPercentage = (fraction: number) =>
  `٪${formatGiftPercentageAmount(fraction)}`

const giftCreditLabel = (percentage: number | null) =>
  percentage != null
    ? `${formatGiftPercentage(percentage)} ${GIFT_CREDIT_LABEL}`
    : null

const buildBodyCopy = (input: {
  lastAchieved: NmvViewStepInput | undefined
  nextStep: NmvViewStepInput | undefined
}): NmvCopyPiece[] | null => {
  const { lastAchieved, nextStep } = input

  if (lastAchieved) {
    return [{ text: ACHIEVED_COPY }]
  }

  if (!nextStep) {
    return null
  }

  const rewardLabel = giftCreditLabel(nextStep.percentage) ?? 'جایزه بعدی'

  if (nextStep.certainProgress <= 0) {
    return [
      { text: ZERO_PROGRESS_COPY_PREFIX },
      { text: rewardLabel, emphasis: true },
      { text: ZERO_PROGRESS_COPY_SUFFIX },
    ]
  }

  const remainingToman = formatPrice(
    toTomanPrice(Math.max(0, nextStep.target - nextStep.certainProgress)),
  )

  return [
    { text: 'فقط ' },
    { text: remainingToman, emphasis: true },
    { text: ' تومان تا ' },
    { text: rewardLabel, emphasis: true },
    { text: ' فاصله داری' },
  ]
}

const segmentProgress = (fromTarget: number, toTarget: number, nmv: number) => {
  if (toTarget <= fromTarget) {
    return nmv >= toTarget ? 100 : 0
  }

  if (nmv <= fromTarget) {
    return 0
  }

  if (nmv >= toTarget) {
    return 100
  }

  return snapSegmentProgressPercent(
    ((nmv - fromTarget) / (toTarget - fromTarget)) * 100,
  )
}

/** Snap 0..100 progress down to the nearest 5% batch. */
export const snapSegmentProgressPercent = (percent: number) => {
  if (percent <= 0) {
    return 0
  }

  if (percent >= 100) {
    return 100
  }

  return Math.floor(percent / 5 + Number.EPSILON) * 5
}

/** 0..100 progress within a target band (from → to), snapped to 5% batches. */
export const resolveSegmentProgressPercent = (
  fromTarget: number,
  toTarget: number,
  certainProgress: number,
) => segmentProgress(fromTarget, toTarget, certainProgress)

/** 0..1 progress within a target band (from → to), snapped to 5% batches. */
export const resolveSegmentProgressRatio = (
  fromTarget: number,
  toTarget: number,
  certainProgress: number,
) => resolveSegmentProgressPercent(fromTarget, toTarget, certainProgress) / 100

/** Synthetic track origin — mirrors CampaignMilestones zero stage (target 0). */
export const NMV_ORIGIN_STEP_ID = 0

export const buildNmvCampaignView = (input: {
  displayName: string
  steps: NmvViewStepInput[]
}): NmvCampaignView => {
  const steps = [...input.steps].sort((a, b) => a.position - b.position)
  const certainProgress = steps[0]?.certainProgress ?? 0

  const lastAchievedWithReward = [...steps]
    .reverse()
    .find((step) => step.effectiveAchieved && step.percentage != null)
  const lastAchieved = [...steps]
    .reverse()
    .find((step) => step.effectiveAchieved)

  const title =
    lastAchievedWithReward?.percentage != null
      ? `${formatGiftPercentageAmount(lastAchievedWithReward.percentage)}٪ ${GIFT_CREDIT_LABEL} ${RECEIVED_TITLE_SUFFIX}`
      : input.displayName

  const nextStep = steps.find(
    (step) => !step.effectiveAchieved && !step.progressionLocked,
  )

  const remainingCopy = buildBodyCopy({ lastAchieved, nextStep })

  const atOrigin = certainProgress <= 0 && lastAchieved == null
  const currentStepId = atOrigin
    ? NMV_ORIGIN_STEP_ID
    : (lastAchieved?.id ?? nextStep?.id ?? steps[0]?.id ?? null)

  if (steps.length === 0) {
    return {
      title,
      remainingCopy,
      trackSteps: [],
      leadingDotCount: 0,
      trailingDotCount: 0,
    }
  }

  const targets = [0, ...steps.map((step) => step.target)]
  const trackIds = [NMV_ORIGIN_STEP_ID, ...steps.map((step) => step.id)]

  const trackSteps: NmvTrackStepView[] = trackIds.map((id, index) => {
    const nextTarget = targets[index + 1]
    const progress =
      nextTarget == null
        ? 0
        : resolveSegmentProgressPercent(
            targets[index] ?? 0,
            nextTarget,
            certainProgress,
          )
    const isCurrent = id === currentStepId
    const isOrigin = id === NMV_ORIGIN_STEP_ID
    const step = isOrigin ? undefined : steps[index - 1]

    return {
      id,
      isActive: isOrigin
        ? certainProgress > 0 || isCurrent
        : Boolean(step?.effectiveAchieved || isCurrent),
      isCurrent,
      segmentProgress: progress,
      enableAnimation: progress > 0 && progress < 100,
    }
  })

  const currentIndex = trackSteps.findIndex((step) => step.isCurrent)
  const window = resolveNmvTrackWindow(
    trackSteps.length,
    currentIndex < 0 ? 0 : currentIndex,
  )

  return {
    title,
    remainingCopy,
    trackSteps: trackSteps.slice(window.start, window.end),
    leadingDotCount: window.leadingDotCount,
    trailingDotCount: window.trailingDotCount,
  }
}
