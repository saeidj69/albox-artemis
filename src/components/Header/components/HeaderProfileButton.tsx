'use client'

import { FC, useEffect, useMemo } from 'react'

import { HamburgerMenu } from 'iconsax-reactjs'

import Animate from '@/components/Animate'
import Profile from '@/components/Profile'
import useProfileModal from '@/components/Profile/hooks'

import { useListClientGames } from '@/api/functions/tyche/client'

import { showDrawer } from '@/lib/Drawer'
import IconButton from '@/lib/IconButton'
import { cn } from '@/lib/utils'

interface HeaderProfileButtonProps {
  variant?: 'home' | 'normal'
}

const HeaderProfileButton: FC<HeaderProfileButtonProps> = (props) => {
  const { variant = 'normal' } = props

  const { data: games } = useListClientGames({
    query: {
      staleTime: 20 * 60 * 1000,
    },
  })

  const shouldShowBadge = useMemo(() => {
    return games?.games.some((game) => game.badges.length > 0)
  }, [games])

  const { showProfileModal, setShowProfileModal } = useProfileModal()

  useEffect(() => {
    if (showProfileModal) {
      showDrawer(Profile)
    }
  }, [showProfileModal])

  return (
    <div className="relative">
      <IconButton
        variant={variant === 'home' ? 'primary' : 'ghost'}
        size="large"
        icon={<HamburgerMenu />}
        onClick={() => {
          showDrawer(Profile)
          setShowProfileModal(true)
        }}
      />
      {shouldShowBadge && (
        <Animate
          animation="fadeIn"
          className={cn(
            'bg-background-main absolute top-2 right-2 pl-0.5',
            variant === 'home' && 'bg-primary-600',
          )}
        >
          <div className="bg-error-main size-2 shrink-0 animate-bounce rounded-full" />
        </Animate>
      )}
    </div>
  )
}

export default HeaderProfileButton
