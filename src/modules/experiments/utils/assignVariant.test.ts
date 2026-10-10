import { describe, expect, it } from 'vitest'

import { ExperimentConfig } from '../types'
import { assignVariant } from './assignVariant'

const SAMPLE_SIZE = 10_000
const TOLERANCE_PERCENT = 3

function fixture(
  id: string,
  variants: ExperimentConfig['variants'],
): ExperimentConfig {
  return { id, title: id, description: id, variants }
}

function runSpread(experiment: ExperimentConfig) {
  const counts: Record<string, number> = {}
  for (const variant of experiment.variants) counts[variant.key] = 0

  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const userId = `user-${i}`
    const variant = assignVariant(userId, experiment)
    counts[variant.key] += 1
  }

  logSpread(experiment, counts)

  return counts
}

function logSpread(
  experiment: ExperimentConfig,
  counts: Record<string, number>,
) {
  console.log(`\n[spread] experiment: ${experiment.id} (n=${SAMPLE_SIZE})`)
  for (const variant of experiment.variants) {
    const actualPercent = (counts[variant.key] / SAMPLE_SIZE) * 100
    console.log(
      `  ${variant.key.padEnd(12)} target=${variant.weight}%  actual=${actualPercent.toFixed(2)}%  count=${counts[variant.key]}`,
    )
  }
}

describe('assignVariant spread', () => {
  it('splits 50/50 within tolerance across 10k users', () => {
    const experiment = fixture('wallet_topup_cta', [
      { key: 'control', label: 'control', weight: 50 },
      { key: 'variant_a', label: 'variant_a', weight: 50 },
    ])

    const counts = runSpread(experiment)

    for (const variant of experiment.variants) {
      const actualPercent = (counts[variant.key] / SAMPLE_SIZE) * 100
      expect(Math.abs(actualPercent - variant.weight)).toBeLessThanOrEqual(
        TOLERANCE_PERCENT,
      )
    }
  })

  it('splits 34/33/33 within tolerance across 10k users', () => {
    const experiment = fixture('checkout_new_flow', [
      { key: 'control', label: 'control', weight: 34 },
      { key: 'variant_a', label: 'variant_a', weight: 33 },
      { key: 'variant_b', label: 'variant_b', weight: 33 },
    ])

    const counts = runSpread(experiment)

    for (const variant of experiment.variants) {
      const actualPercent = (counts[variant.key] / SAMPLE_SIZE) * 100
      expect(Math.abs(actualPercent - variant.weight)).toBeLessThanOrEqual(
        TOLERANCE_PERCENT,
      )
    }
  })

  it('routes only 10% into a low-weight variant', () => {
    const experiment = fixture('risky_feature', [
      { key: 'control', label: 'control', weight: 90 },
      { key: 'variant_a', label: 'variant_a', weight: 10 },
    ])

    const counts = runSpread(experiment)
    const actualPercent = (counts.variant_a / SAMPLE_SIZE) * 100

    expect(Math.abs(actualPercent - 10)).toBeLessThanOrEqual(TOLERANCE_PERCENT)
  })

  it('is deterministic: same user always gets same variant', () => {
    const experiment = fixture('wallet_topup_cta', [
      { key: 'control', label: 'control', weight: 50 },
      { key: 'variant_a', label: 'variant_a', weight: 50 },
    ])

    for (let i = 0; i < 100; i++) {
      const userId = `user-${i}`
      const first = assignVariant(userId, experiment)
      const second = assignVariant(userId, experiment)
      expect(first.key).toBe(second.key)
    }
  })

  it('assigns independent buckets for the same user across different experiments', () => {
    const experimentA = fixture('experiment_a', [
      { key: 'control', label: 'control', weight: 50 },
      { key: 'variant_a', label: 'variant_a', weight: 50 },
    ])
    const experimentB = fixture('experiment_b', [
      { key: 'control', label: 'control', weight: 50 },
      { key: 'variant_a', label: 'variant_a', weight: 50 },
    ])

    let matches = 0
    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const userId = `user-${i}`
      const a = assignVariant(userId, experimentA)
      const b = assignVariant(userId, experimentB)
      if (a.key === b.key) matches += 1
    }

    const matchPercent = (matches / SAMPLE_SIZE) * 100
    console.log(
      `\n[spread] cross-experiment match rate: ${matchPercent.toFixed(2)}% (n=${SAMPLE_SIZE})`,
    )
    expect(matchPercent).toBeGreaterThan(30)
    expect(matchPercent).toBeLessThan(70)
  })
})
