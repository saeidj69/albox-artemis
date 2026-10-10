'use client'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { Ticket } from 'iconsax-reactjs'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { useGetClientBalance } from '@/api/functions/tyche/client'
import {
  ClientRewardType,
  type ClientWheelOfFortuneSlot,
} from '@/api/models/tyche'

import Button from '@/lib/Button'
import Divider from '@/lib/Divider'
import {
  createSheet,
  Sheet,
  SheetFooter,
  SheetHeader,
  useSheet,
} from '@/lib/Sheet'
import { cn } from '@/lib/utils'

type ResultSheetProps = {
  slot: ClientWheelOfFortuneSlot
  onSpinAgain?: () => void
}

const getWinCopy = (slot: ClientWheelOfFortuneSlot) => {
  switch (slot.rewardType) {
    case ClientRewardType.gift_balance:
      return {
        prize: `${formatPrice(toTomanPrice(slot?.attributes?.amount ?? 0))} تومان`,
        description: 'به کیف پول آل‌باکس شما اضافه شد',
      }
    case ClientRewardType.tickets:
      return {
        prize: `${formatPrice(slot?.attributes?.amount ?? 0)} بلیط`,
        description: 'به بلیط‌های شما اضافه شد',
      }
    default:
      return null
  }
}

const ResultSheetComponent = (props: ResultSheetProps) => {
  const { slot, onSpinAgain } = props
  const sheet = useSheet()
  const router = useRouter()

  const { data: gameBalance, isFetching: isLoadingBalance } =
    useGetClientBalance({
      query: {
        refetchOnMount: 'always',
      },
    })

  const isWin = slot.rewardType !== ClientRewardType.naught
  const ticketBalance = gameBalance?.balance ?? 0
  const hasTickets = ticketBalance > 0
  const winCopy = isWin ? getWinCopy(slot) : null

  const hide = () => {
    void sheet.hide()
  }

  const handleSpinAgain = () => {
    hide()
    onSpinAgain?.()
  }

  const handleViewWallet = () => {
    hide()
    router.push(ROUTES.WALLET.ROOT)
  }

  const handleNewOrder = () => {
    hide()
    router.push(ROUTES.HOME)
  }

  return (
    <Sheet
      title={isWin ? 'تبریک!' : 'این بار نشد'}
      description="نتیجه چرخش گردونه شانس"
    >
      <SheetHeader showClose title={''} />

      <div className="flex flex-col items-center gap-3 px-4 pb-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <p className="typo-title-medium text-text-primary">
            {isWin ? '🎉 تبریک!' : '☹️ این بار نشد'}
          </p>

          {isWin && winCopy ? (
            <>
              <p className="typo-title-large text-secondary-600 font-bold">
                {winCopy.prize}
              </p>
              <p className="typo-body-medium text-text-secondary">
                {winCopy.description}
              </p>
            </>
          ) : !isLoadingBalance && hasTickets ? (
            <p className="typo-body-medium text-text-secondary">
              شانستو دوباره امتحان کن!
            </p>
          ) : null}
        </div>

        <Divider className="my-2 w-full" />

        <div className="flex w-full flex-col items-center gap-2">
          {isLoadingBalance ? (
            <div className="h-5 w-48 animate-pulse rounded bg-neutral-100" />
          ) : (
            <div
              className={cn(
                'typo-body-medium flex items-center justify-center gap-1.5',
                hasTickets ? 'text-text-secondary' : 'text-warning-main',
              )}
            >
              <Ticket
                className={cn(
                  'size-5',
                  hasTickets ? 'text-text-secondary' : 'text-warning-main',
                )}
              />
              <span>
                {hasTickets
                  ? `${formatPrice(ticketBalance)} بلیط دیگر باقی مانده`
                  : '۰ بلیط باقی مانده'}
              </span>
            </div>
          )}

          {!isLoadingBalance && !hasTickets ? (
            <p className="typo-body-small text-text-secondary max-w-72">
              با هر سفارش موفق بلیط بگیر و شانستو دوباره امتحان کن!
            </p>
          ) : null}
        </div>
      </div>

      <SheetFooter>
        {isLoadingBalance ? (
          <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
        ) : isWin && slot.rewardType === ClientRewardType.gift_balance ? (
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="ghost"
              size="large"
              className="border-primary-600 text-primary-600 flex-1"
              onClick={handleViewWallet}
            >
              مشاهده کیف پول
            </Button>

            {hasTickets ? (
              <Button
                type="button"
                variant="primary"
                size="large"
                className="flex-1"
                onClick={handleSpinAgain}
              >
                دوباره بچرخون
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="large"
                className="flex-1"
                onClick={handleNewOrder}
              >
                ثبت سفارش جدید
              </Button>
            )}
          </div>
        ) : hasTickets ? (
          <Button
            type="button"
            variant="primary"
            size="large"
            className="w-full"
            onClick={handleSpinAgain}
          >
            دوباره بچرخون
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="large"
            className="w-full"
            onClick={handleNewOrder}
          >
            ثبت سفارش جدید
          </Button>
        )}
      </SheetFooter>
    </Sheet>
  )
}

const ResultSheet = createSheet(ResultSheetComponent)

export default ResultSheet
