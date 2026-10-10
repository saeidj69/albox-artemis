'use client'

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react'

import { PlayButton } from '@videojs/react'
import { MinimalVideoSkin, Video } from '@videojs/react/video'
import '@videojs/react/video/minimal-skin.css'
import { Play } from 'iconsax-reactjs'

import { TutorialPlayer } from '@/modules/tutorial/lib/tutorial-player'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

import './styles.css'

const TUTORIAL_VIDEO_URL = process.env.TUTORIAL_VIDEO_URL ?? ''
const TUTORIAL_VIDEO_POSTER_URL = process.env.TUTORIAL_VIDEO_POSTER_URL ?? ''

export type TutorialVideoPlayerHandle = {
  requestFullscreen: () => void
}

type TutorialVideoPlayerProps = {
  ref?: Ref<TutorialVideoPlayerHandle | null>
  className?: string
}

type WebkitVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void
}

function TutorialPlayOverlay() {
  return (
    <div
      data-slot="tutorial-play-overlay"
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"
    >
      <PlayButton
        render={(props) => (
          <button
            {...props}
            type="button"
            data-slot="tutorial-play-overlay-button"
            className={cn(
              'bg-primary-600 flex size-16 shrink-0 items-center justify-center rounded-full text-white shadow-lg',
              'transition-transform duration-200 select-none active:scale-95',
              'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              props.className,
            )}
            aria-label="پخش ویدئو"
          >
            <Play size={32} className="ms-0.5" aria-hidden />
          </button>
        )}
      />
    </div>
  )
}

function TutorialVideoPlayerInner(props: TutorialVideoPlayerProps) {
  const { ref, className } = props
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      requestFullscreen: () => {
        const video = videoRef.current as WebkitVideoElement | null
        if (!video) return

        const container = video.closest(
          '.media-minimal-skin',
        ) as HTMLElement | null

        if (container?.requestFullscreen) {
          void container.requestFullscreen()
          return
        }

        if (typeof video.webkitEnterFullscreen === 'function') {
          video.webkitEnterFullscreen()
          return
        }

        void video.requestFullscreen?.()
      },
    }),
    [],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video || hasStarted) return

    const onPlay = () => setHasStarted(true)
    video.addEventListener('play', onPlay)

    return () => video.removeEventListener('play', onPlay)
  }, [hasStarted])

  return (
    <AspectRatio
      ratio={16 / 9}
      dir="ltr"
      className={cn('overflow-hidden', className)}
    >
      <div className="relative size-full">
        <MinimalVideoSkin
          className="size-full"
          poster={TUTORIAL_VIDEO_POSTER_URL}
        >
          <Video
            ref={videoRef}
            src={TUTORIAL_VIDEO_URL}
            playsInline
            preload="metadata"
          />
        </MinimalVideoSkin>
        {!hasStarted ? <TutorialPlayOverlay /> : null}
      </div>
    </AspectRatio>
  )
}

const TutorialVideoPlayer = (props: TutorialVideoPlayerProps) => {
  return (
    <TutorialPlayer.Provider>
      <TutorialVideoPlayerInner {...props} />
    </TutorialPlayer.Provider>
  )
}

export default TutorialVideoPlayer
