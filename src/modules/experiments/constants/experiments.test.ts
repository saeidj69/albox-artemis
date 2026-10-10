import { describe, expect, it } from 'vitest'

import { EXPERIMENTS } from './experiments'

describe('EXPERIMENTS config', () => {
  it.each(Object.entries(EXPERIMENTS))(
    '%s: variant weights sum to 100',
    (_name, experiment) => {
      const total = experiment.variants.reduce(
        (sum, variant) => sum + variant.weight,
        0,
      )
      expect(total).toBe(100)
    },
  )
})
