'use client'

import { FC, useState } from 'react'

import { environmentManager, STAGE_API_BASE_URLS } from '@/config/environment'

import Button from '@/lib/Button'
import Dropdown from '@/lib/Dropdown'
import RadioGroup from '@/lib/Radio'
import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'

import { FAB_POSITION_OPTIONS, type FabPosition } from '../constants'

type StageApiSwitcherSheetProps = {
  position: FabPosition
  onPositionChange: (position: FabPosition) => void
}

const StageApiSwitcherSheetComponent: FC<StageApiSwitcherSheetProps> = (
  props,
) => {
  const { position, onPositionChange } = props
  const sheet = useSheet()
  const activeBaseUrl = environmentManager.getApiUrl()
  const [selectedBaseUrl, setSelectedBaseUrl] = useState(activeBaseUrl)
  const [selectedPosition, setSelectedPosition] = useState(position)

  const hasPendingChange =
    selectedBaseUrl !== '' && selectedBaseUrl !== activeBaseUrl

  const handleConfirm = () => {
    if (!hasPendingChange) {
      void sheet.hide()
      return
    }

    environmentManager.setApiUrl(selectedBaseUrl)

    window.location.reload()
  }

  return (
    <Sheet
      title="انتخاب آدرس API"
      description="پس از تأیید، صفحه مجدداً بارگذاری می‌شود."
    >
      <SheetHeader title="انتخاب آدرس API" showClose />

      <div className="p-4 pt-0">
        <p className="typo-body-small text-text-secondary mb-4">
          پس از تأیید، صفحه مجدداً بارگذاری می‌شود.
        </p>

        <Dropdown
          size="small"
          label="موقعیت دکمه"
          placeholder="انتخاب موقعیت"
          className="mb-4 w-full"
          value={selectedPosition}
          onValueChange={(value) => {
            const next = value as FabPosition
            setSelectedPosition(next)
            onPositionChange(next)
          }}
          options={FAB_POSITION_OPTIONS}
        />

        <RadioGroup
          value={selectedBaseUrl}
          onValueChange={setSelectedBaseUrl}
          className="gap-2"
          aria-label="آدرس‌های API"
        >
          {STAGE_API_BASE_URLS.map((baseUrl) => (
            <label
              key={baseUrl}
              className="border-border-lighter hover:bg-background-secondary has-data-[state=checked]:border-primary-600 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors"
            >
              <span
                className="text-text-primary min-w-0 flex-1 truncate text-left text-sm"
                dir="ltr"
              >
                {baseUrl}
              </span>
              <RadioGroup.Item
                value={baseUrl}
                classNames={{
                  item: 'data-[state=checked]:border-primary-600',
                  icon: 'bg-primary-600',
                }}
              />
            </label>
          ))}
        </RadioGroup>

        <div className="mt-4 flex gap-4">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={!hasPendingChange}
            onClick={handleConfirm}
          >
            تأیید و بارگذاری مجدد
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => void sheet.hide()}
          >
            انصراف
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

const StageApiSwitcherSheet = createSheet(StageApiSwitcherSheetComponent)

export default StageApiSwitcherSheet
