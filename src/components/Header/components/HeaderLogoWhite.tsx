'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ROUTES } from '@/constants'

import IconButton from '@/lib/IconButton'

type HeaderLogoProps = {
  asLink?: boolean
}

const HeaderLogoWhite = ({ asLink = true }: HeaderLogoProps) => {
  const logo = (
    <IconButton size="large" variant="primary">
      <div className="relative size-6">
        <Image preload src="/images/logo-white.svg" alt="logo" fill />
      </div>
    </IconButton>
  )

  if (!asLink) return logo

  return (
    <Link href={ROUTES.HOME} passHref prefetch={false}>
      {logo}
    </Link>
  )
}

export default HeaderLogoWhite
