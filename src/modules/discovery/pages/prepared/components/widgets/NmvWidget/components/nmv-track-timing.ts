/** Entrance stagger for track items */
export const ITEM_START_DELAY_MS = 200
export const ITEM_STAGGER_MS = 100

/** Pause after track entrance before the linear fill head starts */
export const FILL_START_DELAY_MS = 0

/** Fixed travel time for one full (100%) segment — progress is linear against this */
export const MS_PER_FULL_SEGMENT = 420

/** Activate / pop this long before the fill head arrives */
export const POP_LEAD_MS = 240

/** Edge-dot light-up pace */
export const EDGE_DOT_STAGGER_MS = Math.round(MS_PER_FULL_SEGMENT / 9)

export type NmvTrackTiming = {
  stepsStartDelay: number
  fillStartMs: number
  leadingStartDelay: number
  trailingStartDelay: number
}

export const resolveNmvTrackTiming = (input: {
  stepCount: number
  leadingDotCount: number
}): NmvTrackTiming => {
  const { stepCount, leadingDotCount } = input
  const stepsStartDelay = ITEM_START_DELAY_MS
  const leadingDotsDuration =
    leadingDotCount > 0 ? (leadingDotCount - 1) * EDGE_DOT_STAGGER_MS : 0

  return {
    stepsStartDelay,
    fillStartMs: stepsStartDelay + FILL_START_DELAY_MS,
    leadingStartDelay: ITEM_START_DELAY_MS,
    trailingStartDelay:
      stepsStartDelay +
      Math.max(leadingDotsDuration, stepCount * ITEM_STAGGER_MS),
  }
}
