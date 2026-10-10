'use client'

import { useEffect } from 'react'

import { CLIENT_STATE_KEYS } from '@/constants/client-state-keys'
import { useClientState } from '@/hooks/useClientState'
import { Maximize3 } from 'iconsax-reactjs'

import ActionSheet from '@/components/ActionSheet'

import { useVideoFullscreen } from '@/modules/tutorial/hooks/use-video-fullscreen'

import { hideSheet, showSheet } from '@/lib/Sheet'

import TutorialVideoPlayer from '../../pages/tutorial/components/tutorialVideoPlayer'

const TutorialManager = () => {
  const {
    setValue,
    value: tutorialState,
    isLoading: isTutorialStateLoading,
  } = useClientState(CLIENT_STATE_KEYS.TUTORIAL)

  const { enterFullscreen, playerRef } = useVideoFullscreen()

  const isTutorialSeen = tutorialState?.seen

  const onSeen = () => {
    setValue({
      seen: true,
      timestamp: Date.now(),
    })
  }

  const onClose = () => {
    hideSheet(ActionSheet)
    onSeen()
  }

  const onEnterFullscreen = () => {
    enterFullscreen()
    onSeen()
  }

  useEffect(() => {
    if (isTutorialStateLoading) return

    if (isTutorialSeen) return

    showSheet(ActionSheet, {
      onClose: onSeen,
      title: 'راهنمای ثبت سفارش',
      description:
        'در این ویدئو، مراحل انتخاب کالا، ثبت سفارش و انتخاب روش پرداخت را به‌صورت کامل برای شما توضیح داده‌ایم.',
      actions: [
        {
          id: 'view',
          variant: 'primary',
          children: 'تمام صفحه',
          startIcon: <Maximize3 />,
          onClick: onEnterFullscreen,
        },
        {
          id: 'close',
          variant: 'ghost',
          children: 'بعدا مشاهده می‌کنم',
          onClick: onClose,
        },
      ],
      children: (
        <div className="mt-8 h-[50vh]">
          <TutorialVideoPlayer ref={playerRef} />
        </div>
      ),
    })
  }, [playerRef, isTutorialSeen, isTutorialStateLoading])

  return null
}

export default TutorialManager
