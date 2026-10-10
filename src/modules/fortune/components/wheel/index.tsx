'use client'

/* eslint-disable @next/next/no-img-element */
import {
  FC,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { EXPERIMENTS, useExperiment } from '@/modules/experiments'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import {
  ClientRewardType,
  type ClientWheelOfFortuneGameAttributes,
  type ClientWheelOfFortuneSlot,
} from '@/api/models/tyche'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

import { sortWheelSlots } from '../../utils/slots'

const BULB_COUNT = 16
/** Distance from center → rim, as % of wheel size (near outer edge). */
const BULB_RADIUS_PERCENT = 45.5
/** Distance from pizza center → label, as % of spin layer. */
const ITEM_RADIUS_PERCENT = 34
const LANDING_TURNS = 4
/** Final turns that decelerate with cubic ease-out. */
const APPROACH_TURNS = 2
const INFINITE_TURN_MS = 900
/** easeOutCubic — decelerate into the winning slice. */
const LANDING_EASING = 'cubic-bezier(0.215, 0.61, 0.355, 1)'
/**
 * easeOutCubic initial slope (y1/x1). Stretch approach duration so handoff
 * velocity matches the linear cruise instead of kicking faster.
 */
const LANDING_EASE_INITIAL_SLOPE = 0.61 / 0.215
const CAROUSEL_SRC = '/sounds/carousel.m4a'
/** Master gain for every fortune sound. */
const SOUND_VOLUME = 0.5
const CAROUSEL_VOLUME = SOUND_VOLUME
/** Duck carousel when drum-start kicks in. */
const CAROUSEL_VOLUME_WITH_DRUM = SOUND_VOLUME * 0.5
const DRUM_START_SRC = '/sounds/drum-start.mp3'
const DRUM_END_SRC = '/sounds/drum-end.mp3'
const RESULT_SOUNDS = {
  happy: '/sounds/happy.m4a',
  sad: '/sounds/sad.m4a',
} as const
const DRUM_START_BEFORE_END_MS = 3000
const DRUM_END_BEFORE_END_MS = 0
const LANDING_RADAR_MS = 3000
const IDLE_WOBBLE_DEG = 3
const IDLE_WOBBLE_MS = 3000
const WHEEL_SPIN_SRC_BY_COLOR: Record<'green' | 'purple', string> = {
  green: '/images/fortune/wheel-spin.png',
  purple: '/images/fortune/wheel-spin-purple.png',
}

export type BlinkPattern = 'alternate' | 'chase' | 'radar'
export type WheelResultSound = keyof typeof RESULT_SOUNDS

const TICK_MS: Record<BlinkPattern, number> = {
  alternate: 700,
  chase: 120,
  radar: 120,
}

export type WheelOfFortuneHandle = {
  startSpin: () => void
  spinToIndex: (index: number) => void
  updateBlinkPatterns: (pattern: BlinkPattern) => void
  playSound: (sound: WheelResultSound) => void
  toggleMute: () => void
}

type WheelOfFortuneProps = {
  ref?: Ref<WheelOfFortuneHandle | null>
  attributes: ClientWheelOfFortuneGameAttributes
  blinkPattern?: BlinkPattern
  onSpinEnded?: (index: number) => void
  onMutedChange?: (muted: boolean) => void
}

type SpinPhase = 'idle' | 'infinite' | 'landing'

const getBulbPosition = (index: number) => {
  // Start at 12 o'clock, go clockwise
  const angleRad = ((360 / BULB_COUNT) * index - 90) * (Math.PI / 180)

  return {
    left: `${50 + BULB_RADIUS_PERCENT * Math.cos(angleRad)}%`,
    top: `${50 + BULB_RADIUS_PERCENT * Math.sin(angleRad)}%`,
  }
}

const getItemPlacement = (index: number, count: number) => {
  // Slice center: start at 12 o'clock, clockwise
  const angleDeg = (360 / count) * index
  const angleRad = (angleDeg - 90) * (Math.PI / 180)

  return {
    angleDeg,
    left: `${50 + ITEM_RADIUS_PERCENT * Math.cos(angleRad)}%`,
    top: `${50 + ITEM_RADIUS_PERCENT * Math.sin(angleRad)}%`,
  }
}

/** Clockwise degrees so `index` lands under the top pointer. */
const getLandingRotation = (index: number, count: number) => {
  const sliceAngle = 360 / count
  return (((360 - index * sliceAngle) % 360) + 360) % 360
}

const splitLabel = (slot: ClientWheelOfFortuneSlot) => {
  switch (slot.rewardType) {
    case ClientRewardType.gift_balance:
      return {
        primary: formatPrice(toTomanPrice(slot.attributes?.amount) ?? 0),
        secondary: 'تومان',
      }

    case ClientRewardType.naught:
      return {
        primary: 'پوچ',
        secondary: ':(',
      }

    case ClientRewardType.tickets:
      return {
        primary: formatPrice(slot.attributes?.amount ?? 0),
        secondary: 'بلیط',
      }

    default:
      return {
        primary: null,
        secondary: null,
      }
  }
}

const circularDistance = (a: number, b: number) => {
  const raw = Math.abs(a - b) % BULB_COUNT
  return Math.min(raw, BULB_COUNT - raw)
}

/** Pattern → which bulbs lit at this tick. */
const isBulbOn = (pattern: BlinkPattern, index: number, tick: number) => {
  switch (pattern) {
    // Classic carnival: every other bulb flips together
    case 'alternate':
      return tick % 2 === 0 ? index % 2 === 0 : index % 2 === 1

    // Comet of 4 bulbs racing around the rim
    case 'chase': {
      const head = tick % BULB_COUNT
      const trail = (head - index + BULB_COUNT) % BULB_COUNT
      return trail < 4
    }

    // Twin hotspots opposite each other, sweeping like radar
    case 'radar': {
      const a = tick % BULB_COUNT
      const b = (a + BULB_COUNT / 2) % BULB_COUNT
      return circularDistance(index, a) <= 1 || circularDistance(index, b) <= 1
    }
  }
}

const getMatrixRotationDeg = (element: HTMLElement) => {
  const { transform } = window.getComputedStyle(element)
  if (!transform || transform === 'none') return 0

  const matrix = new DOMMatrixReadOnly(transform)
  const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI)
  return ((angle % 360) + 360) % 360
}

const LightBulb: FC<{ isOn: boolean }> = (props) => {
  const { isOn } = props

  return isOn ? (
    <div className="size-2.5 rounded-full shadow-[0_0_10px_2px_#FF9500,0_0_8px_4px_rgba(245,217,25,0.45)]">
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.78144 9.1547C6.95982 9.70485 5.99353 9.99901 5.00475 10C4.01596 10.001 3.04909 9.70875 2.22637 9.16024C1.40366 8.61173 0.762041 7.83159 0.382657 6.91844C0.00327306 6.00529 -0.0968295 5.00015 0.0949746 4.0301C0.286779 3.06006 0.76189 2.16866 1.46024 1.46863C2.15859 0.768601 3.04882 0.291368 4.01837 0.0972716C4.98792 -0.096825 5.99323 0.000933525 6.90723 0.378184C7.82122 0.755434 8.60284 1.39524 9.15326 2.2167C9.51899 2.76224 9.77364 3.37451 9.90264 4.01853C10.0316 4.66254 10.0325 5.32567 9.90506 5.97C9.77766 6.61433 9.52454 7.22723 9.16015 7.77368C8.79577 8.32013 8.32727 8.78941 7.78144 9.1547Z"
          fill="url(#paint0_radial_119_682)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_119_682"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(4.24063 6.33305 -6.33275 4.24083 7.30734 5.63027)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F5D919" />
            <stop offset="0.84946" stopColor="#FF9500" />
            <stop offset="1" stopColor="#F5D919" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  ) : (
    <div className="size-2.5">
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.15882 7.77562C8.60995 8.59803 7.82955 9.23923 6.91631 9.61818C6.00307 9.99714 4.99798 10.0968 4.0281 9.90463C3.05821 9.71244 2.1671 9.23701 1.46738 8.53844C0.767662 7.83987 0.290753 6.94952 0.0969702 5.97995C-0.0968124 5.01038 0.00122342 4.00511 0.378674 3.09125C0.756125 2.17739 1.39605 1.39595 2.21755 0.845725C3.03905 0.295498 4.00524 0.0011908 4.99398 3.60598e-06C5.98272 -0.00118359 6.94962 0.2908 7.77244 0.839053C8.31914 1.20331 8.78869 1.67173 9.15427 2.21754C9.51985 2.76335 9.77428 3.37585 9.90303 4.02004C10.0318 4.66424 10.0323 5.32748 9.90463 5.97188C9.77694 6.61628 9.5235 7.22921 9.15882 7.77562Z"
          fill="url(#paint0_radial_125_685)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_125_685"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(6.34242 4.22854 -4.22853 6.34244 7.3729 4.69962)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5C5B59" />
            <stop offset="0.84946" stopColor="#2F2F2F" />
            <stop offset="1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

const WheelSliceLabel: FC<{
  slot: ClientWheelOfFortuneSlot
  index: number
  count: number
}> = (props) => {
  const { slot, index, count } = props
  const { angleDeg, left, top } = getItemPlacement(index, count)
  const { primary, secondary } = splitLabel(slot)

  const isEmoji = secondary === ':)' || secondary === ':('

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left,
        top,
        transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
      }}
    >
      <div
        className={cn(
          'flex w-16 flex-col items-center justify-center',
          'text-center leading-tight text-white',
        )}
      >
        <span
          className={cn(
            'font-medium',
            secondary ? 'typo-body-medium' : 'typo-body-large',
          )}
        >
          {primary}
        </span>

        {secondary ? (
          <span
            className="typo-body-medium font-semibold"
            style={
              isEmoji
                ? { transform: 'rotate(-90deg)', display: 'inline-block' }
                : undefined
            }
          >
            {secondary}
          </span>
        ) : null}
      </div>
    </div>
  )
}

const WheelOfFortune: FC<WheelOfFortuneProps> = (props) => {
  'use no memo'
  const {
    ref,
    attributes,
    blinkPattern: initialBlinkPattern = 'alternate',
    onSpinEnded,
    onMutedChange,
  } = props

  const slots = sortWheelSlots(attributes.slots)

  const colorVariant = useExperiment(EXPERIMENTS.WHEEL_OF_FORTUNE_COLOR)
  const wheelColor = colorVariant?.payload?.color ?? 'green'
  const wheelSpinSrc = WHEEL_SPIN_SRC_BY_COLOR[wheelColor]

  const [tick, setTick] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [idleWobble, setIdleWobble] = useState(IDLE_WOBBLE_DEG)
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('idle')
  const [hasLanded, setHasLanded] = useState(false)
  const [blinkPattern, setBlinkPattern] =
    useState<BlinkPattern>(initialBlinkPattern)
  const [isMuted, setIsMuted] = useState(false)

  // Sync mute state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('fortune_wheel_muted')
    if (stored === 'true') {
      setTimeout(() => {
        setIsMuted(true)
      }, 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const spinLayerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const infiniteStartDegRef = useRef(0)
  const rotationRef = useRef(0)
  const pendingIndexRef = useRef<number | null>(null)
  const spinPhaseRef = useRef<SpinPhase>('idle')

  const audioRefs = useRef<
    { audio: HTMLAudioElement; kind: 'carousel' | 'drum' | 'result' }[]
  >([])
  /**
   * iOS Safari only allows `.play()` on a media element that was itself
   * played from inside a user-gesture call stack (or was already unlocked
   * by one). Sounds triggered later from `setTimeout`/async code lose that
   * gesture chain, so we keep one `Audio` instance per src and "prime" it
   * (muted play+pause) synchronously during `startSpin`, then reuse the
   * same instance for every later, gesture-less playback.
   */
  const audioPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const audioPoolPrimedRef = useRef(false)
  const soundTokenRef = useRef(0)
  const drumTokenRef = useRef(0)
  const soundTimeoutRefs = useRef<number[]>([])

  const skipMutePersistRef = useRef(true)
  // Sync mute state to localStorage and any currently-playing audio elements
  useEffect(() => {
    audioRefs.current.forEach((entry) => {
      entry.audio.muted = isMuted
    })
    if (skipMutePersistRef.current) {
      skipMutePersistRef.current = false
      return
    }
    localStorage.setItem('fortune_wheel_muted', String(isMuted))
  }, [isMuted])

  useEffect(() => {
    onMutedChange?.(isMuted)
  }, [isMuted, onMutedChange])

  const isSpinning = spinPhase !== 'idle'
  const activeBlinkPattern: BlinkPattern = isSpinning
    ? 'chase'
    : hasLanded
      ? 'radar'
      : blinkPattern

  const clearSoundTimeouts = useCallback(() => {
    soundTimeoutRefs.current.forEach((id) => window.clearTimeout(id))
    soundTimeoutRefs.current = []
  }, [])

  const scheduleSoundTimeout = useCallback(
    (fn: () => void, delayMs: number) => {
      const id = window.setTimeout(fn, delayMs)
      soundTimeoutRefs.current.push(id)
    },
    [],
  )

  const stopAudios = useCallback((kind?: 'carousel' | 'drum' | 'result') => {
    audioRefs.current.forEach((entry) => {
      if (kind && entry.kind !== kind) return
      entry.audio.pause()
      entry.audio.loop = false
    })
    if (kind) {
      audioRefs.current = audioRefs.current.filter(
        (entry) => entry.kind !== kind,
      )
    } else {
      audioRefs.current = []
    }
  }, [])

  const pauseAudioPool = useCallback(() => {
    audioPoolRef.current.forEach((audio) => {
      audio.pause()
      audio.loop = false
    })
  }, [])

  const stopSpinSounds = useCallback(() => {
    soundTokenRef.current += 1
    drumTokenRef.current += 1
    clearSoundTimeouts()
    stopAudios()
    pauseAudioPool()
  }, [clearSoundTimeouts, pauseAudioPool, stopAudios])

  const getPooledAudio = useCallback((src: string) => {
    const pool = audioPoolRef.current
    let audio = pool.get(src)
    if (!audio) {
      audio = new Audio(src)
      audio.preload = 'auto'
      pool.set(src, audio)
    }
    return audio
  }, [])

  /**
   * Unlock every non-carousel sound inside the tap gesture that starts a
   * spin. `play()` immediately followed by a synchronous `pause()` (same
   * tick, before the play promise settles) is enough to mark the element as
   * gesture-activated on iOS without an audible blip — there's no time for
   * the audio thread to output a frame before it's paused. Waiting on the
   * play promise instead (muting, then unmuting in `.then()`) isn't safe:
   * iOS can start producing audible output before that callback runs,
   * which plays the sound for real at the wrong time.
   */
  const primeAudioPool = useCallback(() => {
    if (audioPoolPrimedRef.current) return
    audioPoolPrimedRef.current = true
    ;[
      DRUM_START_SRC,
      DRUM_END_SRC,
      RESULT_SOUNDS.happy,
      RESULT_SOUNDS.sad,
    ].forEach((src) => {
      const audio = getPooledAudio(src)
      const playPromise = audio.play()
      audio.pause()
      audio.currentTime = 0
      void playPromise?.catch(() => {})
    })
  }, [getPooledAudio])

  const playTrackedAudio = useCallback(
    (
      src: string,
      kind: 'carousel' | 'drum' | 'result',
      options?: { loop?: boolean; volume?: number },
    ) => {
      return new Promise<void>((resolve) => {
        const audio = getPooledAudio(src)
        audio.loop = options?.loop ?? false
        audio.volume = options?.volume ?? SOUND_VOLUME
        audio.muted = isMuted
        audio.currentTime = 0
        const entry = { audio, kind }
        audioRefs.current.push(entry)

        const finish = () => {
          audio.removeEventListener('ended', finish)
          audio.removeEventListener('error', finish)
          const idx = audioRefs.current.indexOf(entry)
          if (idx !== -1) {
            audioRefs.current.splice(idx, 1)
          }
          resolve()
        }

        if (!audio.loop) {
          audio.addEventListener('ended', finish, { once: true })
        }
        audio.addEventListener('error', finish, { once: true })

        void audio.play()?.catch(finish)
      })
    },
    [getPooledAudio, isMuted],
  )

  const setCarouselVolume = useCallback((volume: number) => {
    audioRefs.current.forEach((entry) => {
      if (entry.kind !== 'carousel') return
      entry.audio.volume = volume
    })
  }, [])

  const playCarouselSound = useCallback(() => {
    stopSpinSounds()
    void playTrackedAudio(CAROUSEL_SRC, 'carousel', {
      loop: true,
      volume: CAROUSEL_VOLUME,
    })
  }, [playTrackedAudio, stopSpinSounds])

  const playLandingSounds = useCallback(
    (durationMs: number) => {
      const drumToken = drumTokenRef.current

      scheduleSoundTimeout(
        () => {
          if (drumToken !== drumTokenRef.current) return

          setCarouselVolume(CAROUSEL_VOLUME_WITH_DRUM)
          void playTrackedAudio(DRUM_START_SRC, 'drum', {
            volume: SOUND_VOLUME,
          })
        },
        Math.max(0, durationMs - DRUM_START_BEFORE_END_MS),
      )

      scheduleSoundTimeout(
        () => {
          if (drumToken !== drumTokenRef.current) return

          stopAudios('drum')
          void playTrackedAudio(DRUM_END_SRC, 'drum', {
            volume: SOUND_VOLUME,
          })
        },
        Math.max(0, durationMs - DRUM_END_BEFORE_END_MS),
      )
    },
    [playTrackedAudio, scheduleSoundTimeout, setCarouselVolume, stopAudios],
  )

  const playSound = useCallback(
    (sound: WheelResultSound) => {
      stopAudios('result')
      void playTrackedAudio(RESULT_SOUNDS[sound], 'result', {
        volume: SOUND_VOLUME,
      })
    },
    [playTrackedAudio, stopAudios],
  )

  const cancelAnimation = useCallback(() => {
    const animation = animationRef.current
    if (!animation) return

    try {
      animation.commitStyles()
    } catch {
      // Animation may already be canceled/finished.
    }
    animation.cancel()
    animationRef.current = null
  }, [])

  const readInfiniteRotation = useCallback(() => {
    const animation = animationRef.current
    const effect = animation?.effect

    if (animation && effect) {
      const timing = effect.getComputedTiming()
      const progress = timing.progress ?? 0
      const iteration = timing.currentIteration ?? 0
      return infiniteStartDegRef.current + (iteration + progress) * 360
    }

    const element = spinLayerRef.current
    if (!element) return rotationRef.current

    const visual = getMatrixRotationDeg(element)
    const base = Math.floor(rotationRef.current / 360) * 360
    let absolute = base + visual
    if (absolute < rotationRef.current - 180) absolute += 360
    if (absolute > rotationRef.current + 180) absolute -= 360
    return absolute
  }, [])

  const readInfiniteProgress = useCallback(() => {
    const animation = animationRef.current
    const effect = animation?.effect
    if (!animation || !effect) return 0

    const timing = effect.getComputedTiming()
    return timing.progress ?? 0
  }, [])

  const finishLanding = useCallback(() => {
    if (spinPhaseRef.current !== 'landing') return

    soundTokenRef.current += 1
    clearSoundTimeouts()
    stopAudios('carousel')

    const landedIndex = pendingIndexRef.current
    pendingIndexRef.current = null
    spinPhaseRef.current = 'idle'
    setSpinPhase('idle')
    setHasLanded(true)
    setBlinkPattern('radar')

    if (landedIndex != null) {
      onSpinEnded?.(landedIndex)
    }
  }, [clearSoundTimeouts, onSpinEnded, stopAudios])

  const startSpin = useCallback(() => {
    if (spinPhaseRef.current !== 'idle' || slots.length === 0) return

    const element = spinLayerRef.current
    if (!element) return

    // Must run synchronously here, inside the tap gesture — later drum/result
    // sounds fire from setTimeout/async code and can't unlock themselves on iOS.
    primeAudioPool()

    cancelAnimation()
    setHasLanded(false)
    setIdleWobble(0)
    setBlinkPattern('chase')

    const startDeg = rotationRef.current
    infiniteStartDegRef.current = startDeg

    animationRef.current = element.animate(
      [
        { transform: `translate(-50%, -50%) rotate(${startDeg}deg)` },
        { transform: `translate(-50%, -50%) rotate(${startDeg + 360}deg)` },
      ],
      {
        duration: INFINITE_TURN_MS,
        iterations: Infinity,
        easing: 'linear',
      },
    )

    spinPhaseRef.current = 'infinite'
    setSpinPhase('infinite')
    playCarouselSound()
  }, [cancelAnimation, playCarouselSound, primeAudioPool, slots.length])

  const spinToIndex = useCallback(
    (index: number) => {
      if (spinPhaseRef.current !== 'infinite' || slots.length === 0) return

      const element = spinLayerRef.current
      if (!element) return

      const clampedIndex =
        ((index % slots.length) + slots.length) % slots.length
      pendingIndexRef.current = clampedIndex

      const current = readInfiniteRotation()
      const progress = readInfiniteProgress()
      const remainingInCycleDeg = (1 - progress) * 360
      const cycleEnd = current + remainingInCycleDeg
      const cycleEndNorm = ((cycleEnd % 360) + 360) % 360
      const landing = getLandingRotation(clampedIndex, slots.length)
      const delta = (((landing - cycleEndNorm) % 360) + 360) % 360

      // Keep linear speed through remaining cycle + cruise turns, then ease-out.
      const cruiseTurns = Math.max(0, LANDING_TURNS - APPROACH_TURNS)
      const cruiseDeg = remainingInCycleDeg + cruiseTurns * 360
      const approachDeg = APPROACH_TURNS * 360 + delta
      const mid = current + cruiseDeg
      const target = mid + approachDeg
      const cruiseMs = (cruiseDeg / 360) * INFINITE_TURN_MS
      const approachMs =
        (approachDeg / 360) * INFINITE_TURN_MS * LANDING_EASE_INITIAL_SLOPE
      const durationMs = Math.max(1, cruiseMs + approachMs)
      const midOffset =
        cruiseDeg <= 0 ? 0 : Math.min(cruiseMs / durationMs, 0.999)

      // Commit current frame, then continue WAAPI without CSS transition gap.
      cancelAnimation()
      rotationRef.current = current
      spinPhaseRef.current = 'landing'

      const landingAnimation = element.animate(
        cruiseDeg > 0
          ? [
              {
                transform: `translate(-50%, -50%) rotate(${current}deg)`,
                easing: 'linear',
              },
              {
                transform: `translate(-50%, -50%) rotate(${mid}deg)`,
                offset: midOffset,
                easing: LANDING_EASING,
              },
              {
                transform: `translate(-50%, -50%) rotate(${target}deg)`,
              },
            ]
          : [
              {
                transform: `translate(-50%, -50%) rotate(${current}deg)`,
                easing: LANDING_EASING,
              },
              {
                transform: `translate(-50%, -50%) rotate(${target}deg)`,
              },
            ],
        {
          duration: durationMs,
          fill: 'forwards',
        },
      )
      animationRef.current = landingAnimation

      setRotation(current)
      setSpinPhase('landing')
      setBlinkPattern('chase')
      playLandingSounds(durationMs)

      landingAnimation.onfinish = () => {
        try {
          landingAnimation.commitStyles()
        } catch {
          // Already canceled.
        }
        landingAnimation.cancel()
        if (animationRef.current === landingAnimation) {
          animationRef.current = null
        }

        rotationRef.current = target
        setRotation(target)
        finishLanding()
      }
    },
    [
      cancelAnimation,
      finishLanding,
      playLandingSounds,
      readInfiniteProgress,
      readInfiniteRotation,
      slots.length,
    ],
  )

  const updateBlinkPatterns = useCallback((pattern: BlinkPattern) => {
    setBlinkPattern(pattern)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      startSpin,
      spinToIndex,
      updateBlinkPatterns,
      playSound,
      toggleMute,
    }),
    [startSpin, spinToIndex, updateBlinkPatterns, playSound, toggleMute],
  )

  useEffect(() => {
    const audioPool = audioPoolRef.current

    return () => {
      cancelAnimation()
      stopSpinSounds()
      audioPool.forEach((audio) => audio.pause())
      audioPool.clear()
    }
  }, [cancelAnimation, stopSpinSounds])

  useEffect(() => {
    const stopWhenPageHidden = () => {
      stopSpinSounds()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopWhenPageHidden()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', stopWhenPageHidden)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', stopWhenPageHidden)
    }
  }, [stopSpinSounds])

  useEffect(() => {
    queueMicrotask(() => {
      setTick(0)
    })

    const tickId = window.setInterval(() => {
      setTick((prev) => prev + 1)
    }, TICK_MS[activeBlinkPattern])

    return () => window.clearInterval(tickId)
  }, [activeBlinkPattern])

  useEffect(() => {
    if (!hasLanded) return

    const timeoutId = window.setTimeout(() => {
      setHasLanded(false)
    }, LANDING_RADAR_MS)

    return () => window.clearTimeout(timeoutId)
  }, [hasLanded])

  useEffect(() => {
    if (isSpinning) {
      queueMicrotask(() => {
        setIdleWobble(0)
      })
      return
    }

    queueMicrotask(() => {
      setIdleWobble(IDLE_WOBBLE_DEG)
    })

    const id = window.setInterval(() => {
      setIdleWobble((prev) => (prev >= 0 ? -IDLE_WOBBLE_DEG : IDLE_WOBBLE_DEG))
    }, IDLE_WOBBLE_MS)

    return () => window.clearInterval(id)
  }, [isSpinning])

  return (
    <div className="relative size-80 overflow-hidden">
      <AspectRatio ratio={1} className="relative">
        <img
          src={
            wheelColor === 'purple'
              ? '/images/fortune/wheel-bg-purple.svg'
              : '/images/fortune/wheel-bg.svg'
          }
          alt="wheel-bg"
          className="size-full"
        />

        <div
          className="absolute z-10 overflow-hidden rounded-full"
          style={{ inset: '8%', backgroundColor: '#FFE195' }}
        >
          {/* The 136/280 radius leaves a fixed gold rim outside the face. */}
          <div
            className="absolute inset-0"
            style={{ clipPath: 'circle(48.5714286%)' }}
          >
            <div
              ref={spinLayerRef}
              className="absolute top-1/2 left-1/2 size-full will-change-transform"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            >
              <div
                className="relative size-full will-change-transform"
                style={{
                  transform: `rotate(${idleWobble}deg)`,
                  transition: isSpinning
                    ? undefined
                    : `transform ${IDLE_WOBBLE_MS}ms ease-in-out`,
                }}
              >
                <img
                  src={wheelSpinSrc}
                  alt="wheel-spin"
                  className="size-full"
                />

                {slots.map((slot, index) => (
                  <WheelSliceLabel
                    key={`${slot.rewardId}-${slot.position}`}
                    slot={slot}
                    index={index}
                    count={slots.length}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <img
          src={
            wheelColor === 'purple'
              ? '/images/fortune/pointer-purple.svg'
              : '/images/fortune/pointer.svg'
          }
          alt="pointer"
          className="absolute top-[7%] left-1/2 z-40 -translate-x-1/2"
        />

        <img
          src={
            wheelColor === 'purple'
              ? '/images/fortune/wheel-pin-purple.svg'
              : '/images/fortune/wheel-pin.svg'
          }
          alt="wheel-pin"
          className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        />

        {Array.from({ length: BULB_COUNT }, (_, index) => {
          const { left, top } = getBulbPosition(index)
          const isOn = isBulbOn(activeBlinkPattern, index, tick)

          return (
            <div
              key={index}
              className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
            >
              <LightBulb isOn={isOn} />
            </div>
          )
        })}
      </AspectRatio>
    </div>
  )
}

export default WheelOfFortune
