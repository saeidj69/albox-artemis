import { describe, expect, test } from 'vitest'

import type { AddressFormValues } from '@/modules/addresses/validation/address-form-schema'

import { act, renderHook } from '@/utils/test-utils'

import { useTempAddressDraft } from './use-temp-address-draft'

const sampleValues: AddressFormValues = {
  name: 'خانه',
  address: 'خیابان تست',
  buildingNumber: '10',
  unit: '2',
  postalCode: '1234567890',
}

describe('useTempAddressDraft', () => {
  test('persists draft values for create mode', () => {
    const { result } = renderHook(() => useTempAddressDraft({ mode: 'create' }))

    expect(result.current.draftValues).toBeNull()

    act(() => {
      result.current.persistDraft(sampleValues)
    })

    expect(result.current.draftValues).toEqual(sampleValues)
  })

  test('clears draft values when clearDraft is called', () => {
    const { result } = renderHook(() => useTempAddressDraft({ mode: 'create' }))

    act(() => {
      result.current.persistDraft(sampleValues)
    })
    expect(result.current.draftValues).not.toBeNull()

    act(() => {
      result.current.clearDraft()
    })

    expect(result.current.draftValues).toBeNull()
  })

  test('ignores draft when scope mode does not match', () => {
    const { result: createHook } = renderHook(() =>
      useTempAddressDraft({ mode: 'create' }),
    )

    act(() => {
      createHook.current.persistDraft(sampleValues)
    })

    const { result: editHook } = renderHook(() =>
      useTempAddressDraft({ mode: 'edit', addressId: 99 }),
    )

    expect(editHook.current.draftValues).toBeNull()
  })
})
