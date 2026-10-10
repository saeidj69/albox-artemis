'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft2, Ticket, VolumeHigh, VolumeSlash } from 'iconsax-reactjs'
import { toast } from 'sonner'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { EXPERIMENTS, useExperiment } from '@/modules/experiments'

import { formatPrice } from '@/utils/numbers'

import {
  getGetClientBalanceQueryKey,
  getListClientPlaysQueryKey,
  useGetClientBalance,
  useGetClientGame,
  useListClientPlays,
  usePlayClientGame,
} from '@/api/functions/tyche/client'
import { getGetPaymentProfileQueryKey } from '@/api/functions/wallet-management'
import {
  ClientRewardRarity,
  ClientRewardType,
  type ClientWheelOfFortuneSlot,
} from '@/api/models/tyche'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'
import IconButton from '@/lib/IconButton'
import { showSheet } from '@/lib/Sheet'

import dividerPurple from '../../assets/divider-purple.svg'
import divider from '../../assets/divider.svg'
import InformationSheet from '../../components/info-sheet'
import ResultSheet from '../../components/result-sheet'
import WheelOfFortune, {
  type WheelOfFortuneHandle,
} from '../../components/wheel'
import { fireLegendaryConfetti } from '../../utils/confetti'
import { sortWheelSlots } from '../../utils/slots'
import FirstPlay from './components/first-play'
import NoTicket from './components/no-ticket'
import PlaysHistory from './components/plays-history'

const BLINK_RESET_MS = 3000
/** Min infinite-spin time before landing (covers fast API responses). */
const MIN_SPIN_MS = 3000
/** Fail the play request before axios's 2-minute timeout leaves the wheel spinning. */
const PLAY_TIMEOUT_MS = 10000

type FortunePageProps = {
  gameId: number
}

const FortunePage = ({ gameId }: FortunePageProps) => {
  const wheelRef = useRef<WheelOfFortuneHandle>(null)
  const wonSlotRef = useRef<ClientWheelOfFortuneSlot | null>(null)
  const spinFailedRef = useRef(false)
  const blinkResetTimeoutRef = useRef<number | null>(null)
  const queryClient = useQueryClient()
  const colorVariant = useExperiment(EXPERIMENTS.WHEEL_OF_FORTUNE_COLOR)
  const isPurpleWheel = colorVariant?.payload?.color === 'purple'
  const [isSpinning, setIsSpinning] = useState(false)
  const [isWheelMuted, setIsWheelMuted] = useState(false)

  const { data: gameBalance, isLoading: isLoadingGameBalance } =
    useGetClientBalance()

  const { data: game } = useGetClientGame(gameId)

  const { data: playsData, isLoading: isLoadingPlays } = useListClientPlays(
    {
      limit: 1,
    },
    {
      query: {
        staleTime: 1000 * 60 * 5,
      },
    },
  )

  const { mutateAsync: playGame } = usePlayClientGame({
    mutation: { networkMode: 'always' },
  })

  useEffect(() => {
    return () => {
      if (blinkResetTimeoutRef.current != null) {
        window.clearTimeout(blinkResetTimeoutRef.current)
      }
    }
  }, [])

  const onOpenInformationSheet = () => {
    showSheet(InformationSheet)
  }

  const handleSpinEnded = (index: number) => {
    if (spinFailedRef.current) {
      spinFailedRef.current = false
      wonSlotRef.current = null
      wheelRef.current?.updateBlinkPatterns('alternate')
      toast.error('بازی انجام نشد، لطفا دوباره تلاش کنید.')
      return
    }

    const slots = game?.game.attributes
      ? sortWheelSlots(game.game.attributes.slots)
      : []
    const wonSlot = wonSlotRef.current ?? slots[index] ?? null
    wonSlotRef.current = null

    if (!wonSlot) return

    if (wonSlot.rarity === ClientRewardRarity.mythic) {
      fireLegendaryConfetti()
    }

    if (blinkResetTimeoutRef.current != null) {
      window.clearTimeout(blinkResetTimeoutRef.current)
    }

    blinkResetTimeoutRef.current = window.setTimeout(() => {
      wheelRef.current?.updateBlinkPatterns('alternate')
      blinkResetTimeoutRef.current = null
    }, BLINK_RESET_MS)

    void queryClient.invalidateQueries({
      queryKey: getGetClientBalanceQueryKey(),
    })

    void queryClient.invalidateQueries({
      queryKey: getListClientPlaysQueryKey(),
    })

    if (wonSlot?.rewardType === ClientRewardType.gift_balance) {
      queryClient.invalidateQueries({
        queryKey: getGetPaymentProfileQueryKey(),
      })
    }

    setTimeout(() => {
      if (wonSlot.rarity === ClientRewardRarity.shit) {
        wheelRef.current?.playSound('sad')
      } else {
        wheelRef.current?.playSound('happy')
      }

      setIsSpinning(false)

      showSheet(ResultSheet, {
        slot: wonSlot,
        onSpinAgain: handleSpin,
      })
    }, 500)
  }

  const handleSpin = async () => {
    if (!game?.game.attributes) return

    const slots = sortWheelSlots(game.game.attributes.slots)

    if (slots.length === 0) return

    setIsSpinning(true)

    wonSlotRef.current = null
    spinFailedRef.current = false
    wheelRef.current?.updateBlinkPatterns('chase')
    wheelRef.current?.startSpin()

    const spinStartedAt = performance.now()
    const idempotencyKey = crypto.randomUUID()

    const waitForMinSpin = async () => {
      const elapsed = performance.now() - spinStartedAt
      const remaining = Math.max(0, MIN_SPIN_MS - elapsed)
      if (remaining > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remaining)
        })
      }
    }

    let playTimeoutId: number | undefined

    try {
      const { play } = await Promise.race([
        playGame({
          game: gameId,
          params: { idempotencyKey },
        }),
        new Promise<never>((_, reject) => {
          playTimeoutId = window.setTimeout(
            () => reject(new Error('timeout')),
            PLAY_TIMEOUT_MS,
          )
        }),
      ])

      const slotIndex = slots.findIndex(
        (slot) => slot.rewardId === play.reward.id,
      )

      const resolvedIndex = slotIndex >= 0 ? slotIndex : 0

      wonSlotRef.current = slots[resolvedIndex] ?? null

      await waitForMinSpin()

      wheelRef.current?.spinToIndex(resolvedIndex)
    } catch {
      // Keep wheel from spinning forever if play request fails.
      spinFailedRef.current = true
      wonSlotRef.current = null
      await waitForMinSpin()
      wheelRef.current?.spinToIndex(0)
    } finally {
      if (playTimeoutId != null) {
        window.clearTimeout(playTimeoutId)
      }
    }
  }

  const hasTickets = (gameBalance?.balance ?? 0) > 0

  const isFirstPlay = !isLoadingPlays && (playsData?.plays?.length ?? 0) === 0

  return (
    <>
      <Layout.Header height={64}>
        <Header
          center={game?.game?.shortDescription}
          right={<HeaderBackButton />}
        />
      </Layout.Header>

      <div className="flex items-center justify-between pt-4">
        {isLoadingGameBalance ? (
          <Chip.Skeleton className="w-32" />
        ) : (
          <Chip
            content={formatPrice(gameBalance?.balance ?? 0) + ' بلیط فعال'}
            start={<Ticket />}
            variant="ghost"
            classNames={{
              start: hasTickets
                ? 'text-secondary-600 size-4'
                : 'text-warning-dark size-4',
              root: hasTickets ? 'bg-secondary-50' : 'bg-warning-lighter',
              content: hasTickets ? 'text-secondary-600' : 'text-warning-main',
            }}
          />
        )}

        <Button
          onClick={onOpenInformationSheet}
          variant="text"
          size="small"
          endIcon={<ArrowLeft2 />}
        >
          راهنمای دریافت بلیط
        </Button>
      </div>

      <div
        className={`-mx-4 -mb-10 pb-10 ${isPurpleWheel ? 'bg-[#F2ECFC]' : 'bg-amber-50'}`}
      >
        <div className="-my-px">
          <Image
            src={isPurpleWheel ? dividerPurple : divider}
            alt="divider"
            className="w-full"
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          {game?.game.attributes ? (
            <WheelOfFortune
              ref={wheelRef}
              attributes={game.game.attributes}
              onSpinEnded={handleSpinEnded}
              onMutedChange={setIsWheelMuted}
            />
          ) : null}

          <div className="relative flex w-full flex-col gap-3 p-4 pt-0">
            <IconButton
              type="button"
              variant="secondary"
              size="large"
              onClick={() => wheelRef.current?.toggleMute()}
              className="absolute -top-14 left-4 z-20"
            >
              {isWheelMuted ? <VolumeSlash /> : <VolumeHigh />}
            </IconButton>

            {hasTickets && (
              <Button
                type="button"
                variant="primary"
                size="large"
                disabled={isSpinning || !hasTickets || !game?.game.attributes}
                onClick={handleSpin}
                className="w-full"
              >
                بچرخون!
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-4">
        {!isLoadingPlays && isFirstPlay && <FirstPlay />}

        {!isLoadingGameBalance && !hasTickets && !isFirstPlay && (
          <NoTicket onGuideClick={onOpenInformationSheet} />
        )}

        <PlaysHistory />
      </div>
    </>
  )
}

export default FortunePage
