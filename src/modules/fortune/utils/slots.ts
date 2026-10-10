import {
  ClientRewardRarity,
  type ClientWheelOfFortuneSlot,
} from '@/api/models/tyche'

const MYTHIC_INDEX = 3

/** Mythic pinned at wheel index 3; rotate API `position` order without reordering slices. */
export const sortWheelSlots = (slots: ClientWheelOfFortuneSlot[]) => {
  const sorted = [...slots].sort((a, b) => a.position - b.position)

  const mythicIndex = sorted.findIndex(
    (slot) => slot.rarity === ClientRewardRarity.mythic,
  )

  if (mythicIndex === -1) return sorted

  const count = sorted.length
  const offset = (mythicIndex - MYTHIC_INDEX + count) % count

  return sorted.map((_, index) => sorted[(index + offset) % count])
}
