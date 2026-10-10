import { describe, expect, test } from 'vitest'

import {
  isMilestoneProgressComplete,
  resolveLogoVisibilityLength,
  resolvePassedStepIndex,
  resolveSegmentProgressRatio,
  resolveTargetPathLength,
  resolveTravelDurationMs,
} from './MilestonePath'

describe('resolveSegmentProgressRatio', () => {
  test('clamps within a target band', () => {
    expect(resolveSegmentProgressRatio(0, 100, 0)).toBe(0)
    expect(resolveSegmentProgressRatio(0, 100, 50)).toBe(0.5)
    expect(resolveSegmentProgressRatio(0, 100, 100)).toBe(1)
    expect(resolveSegmentProgressRatio(0, 100, 150)).toBe(1)
    expect(resolveSegmentProgressRatio(100, 200, 50)).toBe(0)
  })

  test('snaps progress to 5% batches within a segment', () => {
    expect(resolveSegmentProgressRatio(0, 100, 4)).toBe(0)
    expect(resolveSegmentProgressRatio(0, 100, 5)).toBe(0.05)
    expect(resolveSegmentProgressRatio(0, 100, 9)).toBe(0.05)
    expect(resolveSegmentProgressRatio(0, 100, 19)).toBe(0.15)
    expect(resolveSegmentProgressRatio(0, 100, 20)).toBe(0.2)
    expect(resolveSegmentProgressRatio(0, 100, 37)).toBe(0.35)
    expect(resolveSegmentProgressRatio(0, 100, 99)).toBe(0.95)
    expect(resolveSegmentProgressRatio(100, 200, 123)).toBe(0.2)
  })
})

describe('resolveTargetPathLength', () => {
  const segments = [100, 100, 100]
  const targets = [0, 100, 200, 300]

  test('stays at the start with zero progress', () => {
    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 0,
      }),
    ).toBe(0)
  })

  test('places the logo on 5% batch marks within a segment', () => {
    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 50,
      }),
    ).toBe(50)

    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 53,
      }),
    ).toBe(50)

    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 150,
      }),
    ).toBe(150)

    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 157,
      }),
    ).toBe(155)
  })

  test('fills completed segments and parks at path end when finished', () => {
    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 100,
      }),
    ).toBe(100)

    expect(
      resolveTargetPathLength({
        segmentLengths: segments,
        stepTargets: targets,
        certainProgress: 300,
      }),
    ).toBe(300)
  })
})

describe('resolvePassedStepIndex', () => {
  test('keeps step 0 active at the path start', () => {
    expect(
      resolvePassedStepIndex({
        animatedLength: 0,
        segmentLengths: [100, 100],
        stepCount: 3,
      }),
    ).toBe(0)
  })

  test('advances as the logo reaches later steps', () => {
    expect(
      resolvePassedStepIndex({
        animatedLength: 100,
        segmentLengths: [100, 100],
        stepCount: 3,
      }),
    ).toBe(1)

    expect(
      resolvePassedStepIndex({
        animatedLength: 200,
        segmentLengths: [100, 100],
        stepCount: 3,
      }),
    ).toBe(2)
  })
})

describe('resolveTravelDurationMs', () => {
  test('scales with progress and respects the minimum', () => {
    expect(resolveTravelDurationMs({ targetLength: 0, totalLength: 100 })).toBe(
      2700,
    )

    expect(
      resolveTravelDurationMs({ targetLength: 50, totalLength: 100 }),
    ).toBe(3300)

    expect(
      resolveTravelDurationMs({ targetLength: 100, totalLength: 100 }),
    ).toBe(6600)
  })
})

describe('isMilestoneProgressComplete', () => {
  test('is true only after the final target is reached', () => {
    expect(
      isMilestoneProgressComplete({
        stepTargets: [0, 100, 200],
        certainProgress: 199,
      }),
    ).toBe(false)

    expect(
      isMilestoneProgressComplete({
        stepTargets: [0, 100, 200],
        certainProgress: 200,
      }),
    ).toBe(true)
  })
})

describe('resolveLogoVisibilityLength', () => {
  test('hides the logo until after 5% into the first segment', () => {
    expect(
      resolveLogoVisibilityLength({
        length: 0,
        segmentLengths: [100, 100],
      }),
    ).toBeNull()

    expect(
      resolveLogoVisibilityLength({
        length: 5,
        segmentLengths: [100, 100],
      }),
    ).toBeNull()

    expect(
      resolveLogoVisibilityLength({
        length: 6,
        segmentLengths: [100, 100],
      }),
    ).toBe(6)
  })

  test('hides the logo when approaching or just leaving a step', () => {
    // Approaching step 1 (end of first segment)
    expect(
      resolveLogoVisibilityLength({
        length: 95,
        segmentLengths: [100, 100],
      }),
    ).toBeNull()

    // Mid first segment — visible
    expect(
      resolveLogoVisibilityLength({
        length: 50,
        segmentLengths: [100, 100],
      }),
    ).toBe(50)

    // Just past step 1 (start of second segment)
    expect(
      resolveLogoVisibilityLength({
        length: 105,
        segmentLengths: [100, 100],
      }),
    ).toBeNull()

    // Mid second segment — visible
    expect(
      resolveLogoVisibilityLength({
        length: 150,
        segmentLengths: [100, 100],
      }),
    ).toBe(150)

    // Approaching final step
    expect(
      resolveLogoVisibilityLength({
        length: 95 + 100,
        segmentLengths: [100, 100],
      }),
    ).toBeNull()
  })
})
