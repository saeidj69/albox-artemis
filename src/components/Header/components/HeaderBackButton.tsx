'use client'

import { FC } from 'react'

import { useRouter } from 'next/navigation'

import { ArrowRight2 } from 'iconsax-reactjs'
import { getPreviousPath } from 'navlens'

import IconButton from '@/lib/IconButton'

interface HeaderBackButtonProps {
  fallback?: string
  onBack?: () => void
}

const HeaderBackButton: FC<HeaderBackButtonProps> = (props) => {
  const { fallback, onBack } = props

  const router = useRouter()

  const handleBack = () => {
    onBack?.()

    const previous = getPreviousPath()

    const isPreviousPathAPP = previous?.includes(process.env.APP_URL ?? '')

    if (previous && !isPreviousPathAPP) {
      router.back()
    } else {
      router.push(fallback ?? '/')
    }
  }

  return (
    <IconButton variant="ghost" onClick={handleBack}>
      <ArrowRight2 />
    </IconButton>
  )
}

export default HeaderBackButton
