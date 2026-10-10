'use client'

import { useState } from 'react'

import { environmentManager } from '@/config/environment'
import { Link } from 'iconsax-reactjs'

import { showSheet } from '@/lib/Sheet'
import { cn } from '@/lib/utils'

import Animate from '../Animate'
import StageApiSwitcherSheet from './components/stage-api-switcher-sheet'
import {
  DEFAULT_FAB_POSITION,
  FAB_POSITION_CLASSES,
  type FabPosition,
} from './constants'

const StageApiSwitcher = () => {
  const [position, setPosition] = useState<FabPosition>(DEFAULT_FAB_POSITION)

  if (!environmentManager.isApiSwitcherEnabled()) {
    return null
  }

  return (
    <Animate
      animation="slideRight"
      className={cn(
        'fixed z-50 transition-[top,bottom,left,right] duration-200',
        FAB_POSITION_CLASSES[position],
      )}
    >
      <button
        type="button"
        aria-label="تغییر آدرس API"
        onClick={() =>
          showSheet(StageApiSwitcherSheet, {
            position,
            onPositionChange: setPosition,
          })
        }
        className={cn(
          'bg-secondary-600 hover:bg-secondary-700 size-12 active:scale-95',
          'grid place-items-center rounded-full shadow-2xl transition-all',
        )}
      >
        <Link size={24} className="text-white" />
      </button>
    </Animate>
  )
}

export default StageApiSwitcher
