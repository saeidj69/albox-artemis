import type { ComponentProps } from 'react'

import Link from 'next/link'

import { shouldOpenLinkInNewTab } from '@/utils/navigation/should-open-link-in-new-tab'

type AutoLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string
  prefetch?: boolean
}

const AutoLink = (props: AutoLinkProps) => {
  const { href, children, prefetch, ...anchorProps } = props

  if (shouldOpenLinkInNewTab(href)) {
    return (
      <a href={href} {...anchorProps} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <Link href={href} prefetch={prefetch} {...anchorProps}>
      {children}
    </Link>
  )
}

export default AutoLink
