import { ExperimentConfig } from '../types'
import { fnv1a } from './hash'

export function assignVariant<T extends ExperimentConfig>(
  userId: string,
  experiment: T,
): T['variants'][number] {
  const bucket = fnv1a(`${userId}:${experiment.id}`) % 100

  let cumulative = 0

  for (const variant of experiment.variants) {
    cumulative += variant.weight
    if (bucket < cumulative) {
      return variant
    }
  }

  return experiment.variants[experiment.variants.length - 1]
}
