import { describe, expect, test } from 'vitest'

import {
  ClientRewardRarity,
  type ClientWheelOfFortuneSlot,
} from '@/api/models/tyche'

import { sortWheelSlots } from './slots'

describe('sortWheelSlots', () => {
  test('returns sorted slots when no mythic slot is present', () => {
    const slots = [
      { rewardId: 2, position: 2, rarity: ClientRewardRarity.common },
      { rewardId: 1, position: 1, rarity: ClientRewardRarity.rare },
    ] as ClientWheelOfFortuneSlot[]

    const result = sortWheelSlots(slots)

    expect(result.map((s) => s.position)).toEqual([1, 2])
  })

  test('rotates slots so mythic slot is placed at index 3', () => {
    const slots = [
      { rewardId: 1, position: 1, rarity: ClientRewardRarity.common },
      { rewardId: 2, position: 2, rarity: ClientRewardRarity.rare },
      { rewardId: 3, position: 3, rarity: ClientRewardRarity.legendary },
      { rewardId: 4, position: 4, rarity: ClientRewardRarity.common },
      { rewardId: 5, position: 5, rarity: ClientRewardRarity.mythic }, // mythic at sorted index 4
      { rewardId: 6, position: 6, rarity: ClientRewardRarity.common },
    ] as ClientWheelOfFortuneSlot[]

    const result = sortWheelSlots(slots)

    expect(result[3].rarity).toBe(ClientRewardRarity.mythic)
    expect(result[3].rewardId).toBe(5)
  })

  test('handles empty array', () => {
    expect(sortWheelSlots([])).toEqual([])
  })
})
