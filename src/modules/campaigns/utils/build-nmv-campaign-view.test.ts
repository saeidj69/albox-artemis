import { describe, expect, test } from 'vitest'

import {
  buildNmvCampaignView,
  formatGiftPercentage,
  formatGiftPercentageAmount,
  readGiftPercentage,
  resolveNmvTrackWindow,
  snapSegmentProgressPercent,
  type NmvViewStepInput,
} from './build-nmv-campaign-view'

const step = (
  overrides: Partial<NmvViewStepInput> &
    Pick<NmvViewStepInput, 'id' | 'position'>,
): NmvViewStepInput => ({
  certainProgress: 0,
  target: 100_000_000,
  effectiveAchieved: false,
  percentage: 0.01,
  ...overrides,
})

describe('formatGiftPercentage', () => {
  test('formats a whole percent', () => {
    expect(formatGiftPercentageAmount(0.01)).toBe('۱')
    expect(formatGiftPercentage(0.01)).toBe('٪۱')
  })

  test('formats a fractional percent', () => {
    const amount = (1.2).toLocaleString('fa-IR', { maximumFractionDigits: 2 })
    expect(formatGiftPercentageAmount(0.012)).toBe(amount)
    expect(formatGiftPercentage(0.012)).toBe(`٪${amount}`)
  })
})

describe('snapSegmentProgressPercent', () => {
  test('snaps to 5% batches', () => {
    expect(snapSegmentProgressPercent(0)).toBe(0)
    expect(snapSegmentProgressPercent(4)).toBe(0)
    expect(snapSegmentProgressPercent(5)).toBe(5)
    expect(snapSegmentProgressPercent(9)).toBe(5)
    expect(snapSegmentProgressPercent(19)).toBe(15)
    expect(snapSegmentProgressPercent(20)).toBe(20)
    expect(snapSegmentProgressPercent(27)).toBe(25)
    expect(snapSegmentProgressPercent(39)).toBe(35)
    expect(snapSegmentProgressPercent(40)).toBe(40)
    expect(snapSegmentProgressPercent(99)).toBe(95)
    expect(snapSegmentProgressPercent(100)).toBe(100)
  })
})

describe('readGiftPercentage', () => {
  test('reads a positive percentage', () => {
    expect(readGiftPercentage({ percentage: 0.015 })).toBe(0.015)
  })

  test('returns null for missing or invalid payloads', () => {
    expect(readGiftPercentage(undefined)).toBeNull()
    expect(readGiftPercentage({ percentage: 0 })).toBeNull()
    expect(readGiftPercentage({ percentage: '0.01' })).toBeNull()
  })
})

describe('buildNmvCampaignView', () => {
  test('uses displayName and zero-progress copy when no delivered orders exist', () => {
    const view = buildNmvCampaignView({
      displayName: 'خرید آخر آخر شهریور',
      steps: [
        step({
          id: 7,
          position: 1,
          target: 200_000_000,
          certainProgress: 0,
          percentage: 0.01,
        }),
        step({
          id: 8,
          position: 2,
          target: 1_500_000_000,
          certainProgress: 0,
          progressionLocked: true,
          percentage: 0.02,
        }),
        step({
          id: 9,
          position: 3,
          target: 3_000_000_000,
          certainProgress: 0,
          progressionLocked: true,
          percentage: 0.03,
        }),
      ],
    })

    expect(view.title).toBe('خرید آخر آخر شهریور')
    expect(view.remainingCopy).toEqual([
      { text: 'با هر سفارش موفق، یک قدم به ' },
      { text: '٪۱ اعتبار هدیه', emphasis: true },
      { text: ' نزدیک‌تر شو.' },
    ])
  })

  test('shows the exact remaining toman toward the next gift credit', () => {
    const view = buildNmvCampaignView({
      displayName: 'خرید آخر آخر شهریور',
      steps: [
        step({
          id: 7,
          position: 1,
          target: 200_000_000,
          certainProgress: 183_191_000,
          percentage: 0.01,
        }),
      ],
    })

    expect(view.title).toBe('خرید آخر آخر شهریور')
    expect(view.remainingCopy).toEqual([
      { text: 'فقط ' },
      { text: '۱٬۶۸۰٬۹۰۰', emphasis: true },
      { text: ' تومان تا ' },
      { text: '٪۱ اعتبار هدیه', emphasis: true },
      { text: ' فاصله داری' },
    ])
  })

  test('switches title and copy after the first step is achieved', () => {
    const view = buildNmvCampaignView({
      displayName: 'خرید آخر آخر شهریور',
      steps: [
        step({
          id: 7,
          position: 1,
          target: 200_000_000,
          certainProgress: 200_000_000,
          effectiveAchieved: true,
          percentage: 0.01,
        }),
        step({
          id: 8,
          position: 2,
          target: 1_500_000_000,
          certainProgress: 200_000_000,
          percentage: 0.02,
        }),
      ],
    })

    expect(view.title).toBe('۱٪ اعتبار هدیه دریافت کردید')
    expect(view.remainingCopy).toEqual([
      {
        text: 'تبریک! پس از اتمام دوره، اعتبار هدیه شما فعال می‌شود.',
      },
    ])
    expect(view.trackSteps.find((step) => step.id === 7)).toMatchObject({
      isActive: true,
      isCurrent: true,
    })
  })

  test('builds track segments from live evaluation while a later step is in progress', () => {
    const view = buildNmvCampaignView({
      displayName: 'کمپین مهر',
      steps: [
        step({
          id: 1,
          position: 1,
          target: 200_000_000,
          certainProgress: 326_809_000,
          effectiveAchieved: true,
          percentage: 0.01,
        }),
        step({
          id: 2,
          position: 2,
          target: 300_000_000,
          certainProgress: 326_809_000,
          effectiveAchieved: true,
          percentage: 0.01,
        }),
        step({
          id: 3,
          position: 3,
          target: 400_000_000,
          certainProgress: 326_809_000,
          effectiveAchieved: false,
          percentage: 0.012,
        }),
        step({
          id: 4,
          position: 4,
          target: 800_000_000,
          certainProgress: 326_809_000,
          effectiveAchieved: false,
          progressionLocked: true,
          percentage: 0.02,
        }),
      ],
    })

    expect(view.title).toBe('۱٪ اعتبار هدیه دریافت کردید')
    expect(view.remainingCopy).toEqual([
      {
        text: 'تبریک! پس از اتمام دوره، اعتبار هدیه شما فعال می‌شود.',
      },
    ])
    // 5 track nodes (>4) → window of 4: [step1..step4]; origin → leading edge dots
    expect(view.trackSteps[0]).toMatchObject({
      id: 1,
      isActive: true,
      isCurrent: false,
      segmentProgress: 100,
      enableAnimation: false,
    })
    expect(view.trackSteps[1]).toMatchObject({
      id: 2,
      isActive: true,
      isCurrent: true,
      segmentProgress: 25,
      enableAnimation: true,
    })
    expect(view.trackSteps[2]).toMatchObject({
      id: 3,
      isActive: false,
      isCurrent: false,
      segmentProgress: 0,
    })
    expect(view.trackSteps[3]).toMatchObject({
      id: 4,
      isActive: false,
      isCurrent: false,
      segmentProgress: 0,
    })
    expect(view.trackSteps).toHaveLength(4)
    expect(view.leadingDotCount).toBe(3)
    expect(view.trailingDotCount).toBe(0)
  })

  test('fills the origin→first segment from certainProgress like MilestonePath', () => {
    const view = buildNmvCampaignView({
      displayName: 'کمپین مهر',
      steps: [
        step({
          id: 7,
          position: 1,
          target: 200_000_000,
          certainProgress: 100_000_000,
          percentage: 0.01,
        }),
        step({
          id: 8,
          position: 2,
          target: 400_000_000,
          certainProgress: 100_000_000,
          progressionLocked: true,
          percentage: 0.02,
        }),
      ],
    })

    expect(view.trackSteps[0]).toMatchObject({
      id: 0,
      isActive: true,
      isCurrent: false,
      segmentProgress: 50,
      enableAnimation: true,
    })
    expect(view.trackSteps[1]).toMatchObject({
      id: 7,
      isActive: true,
      isCurrent: true,
      segmentProgress: 0,
    })
    expect(view.leadingDotCount).toBe(0)
    expect(view.trailingDotCount).toBe(0)
  })

  test('keeps displayName when the achieved step has no reward percentage', () => {
    const view = buildNmvCampaignView({
      displayName: 'کمپین مهر',
      steps: [
        step({
          id: 1,
          position: 1,
          target: 200_000_000,
          certainProgress: 200_000_000,
          effectiveAchieved: true,
          percentage: null,
        }),
      ],
    })

    expect(view.title).toBe('کمپین مهر')
    expect(view.remainingCopy).toEqual([
      {
        text: 'تبریک! پس از اتمام دوره، اعتبار هدیه شما فعال می‌شود.',
      },
    ])
    expect(view.trackSteps).toEqual([
      expect.objectContaining({
        id: 0,
        isActive: true,
        isCurrent: false,
        segmentProgress: 100,
      }),
      expect.objectContaining({
        id: 1,
        isActive: true,
        isCurrent: true,
        segmentProgress: 0,
      }),
    ])
    expect(view.leadingDotCount).toBe(0)
    expect(view.trailingDotCount).toBe(0)
  })

  test('parks the current marker on the origin before any NMV is delivered', () => {
    const view = buildNmvCampaignView({
      displayName: 'کمپین مهر',
      steps: [
        step({
          id: 7,
          position: 1,
          target: 200_000_000,
          certainProgress: 0,
          percentage: 0.01,
        }),
        step({
          id: 8,
          position: 2,
          target: 400_000_000,
          certainProgress: 0,
          progressionLocked: true,
          percentage: 0.02,
        }),
      ],
    })

    expect(view.trackSteps[0]).toMatchObject({
      id: 0,
      isActive: true,
      isCurrent: true,
      segmentProgress: 0,
    })
    expect(view.trackSteps[1]).toMatchObject({
      id: 7,
      isActive: false,
      isCurrent: false,
    })
  })
})

describe('resolveNmvTrackWindow', () => {
  test('shows all steps with no edge dots when total is 3', () => {
    expect(resolveNmvTrackWindow(3, 1)).toEqual({
      start: 0,
      end: 3,
      leadingDotCount: 0,
      trailingDotCount: 0,
    })
  })

  test('shows all 4 steps with no edge dots', () => {
    expect(resolveNmvTrackWindow(4, 2)).toEqual({
      start: 0,
      end: 4,
      leadingDotCount: 0,
      trailingDotCount: 0,
    })
  })

  test('windows to 4 steps and adds 3 trailing edge dots when more than 4', () => {
    expect(resolveNmvTrackWindow(5, 0)).toEqual({
      start: 0,
      end: 4,
      leadingDotCount: 0,
      trailingDotCount: 3,
    })
  })

  test('shows 4 steps in the middle with 3 edge dots on both sides', () => {
    expect(resolveNmvTrackWindow(8, 4)).toEqual({
      start: 3,
      end: 7,
      leadingDotCount: 3,
      trailingDotCount: 3,
    })
  })

  test('shows last 4 steps with 3 leading edge dots', () => {
    expect(resolveNmvTrackWindow(5, 4)).toEqual({
      start: 1,
      end: 5,
      leadingDotCount: 3,
      trailingDotCount: 0,
    })
  })
})
