'use client'

import { use, useEffect } from 'react'

import { EVENTS, track, WETransformer } from '@/helpers/analytics'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import FortunePage from '@/modules/fortune/pages/fortune'

import { useGetClientGame } from '@/api/functions/tyche/client'
import { ClientWheelOfFortuneGameType } from '@/api/models/tyche'

import Skeleton from '@/lib/Skeleton'

type GamePageProps = {
  params: Promise<{
    gameId: string
  }>
}

const GamePage = ({ params }: GamePageProps) => {
  const { gameId } = use(params)
  const id = Number(gameId)

  const { data: game } = useGetClientGame(id)

  useEffect(() => {
    if (!Number.isFinite(id)) return

    track(EVENTS.VIEW_GAMES, {
      webengage: WETransformer.toViewGames(id),
    })
  }, [id])

  const content =
    game?.game?.type === ClientWheelOfFortuneGameType.wheel_of_fortune ? (
      <FortunePage gameId={id} />
    ) : (
      <>
        <Layout.Header height={64}>
          <Header
            center={
              game?.game?.shortDescription || (
                <div className="flex w-full justify-center">
                  <Skeleton className="rounded-brand h-4 w-24" />
                </div>
              )
            }
            right={<HeaderBackButton />}
          />
        </Layout.Header>

        <div className="-mx-4 h-screen">
          <Skeleton className="h-full w-full" />
        </div>
      </>
    )

  return content
}

export default GamePage
