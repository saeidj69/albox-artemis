'use client'

import { Suspense, useContext, useEffect, useRef } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { hide, NiceModalContext, Provider } from '@ebay/nice-modal-react'

const NiceModalRouteChangeHandler = () => {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const modals = useContext(NiceModalContext)
  const modalIdsRef = useRef<string[]>([])

  useEffect(() => {
    modalIdsRef.current = Object.keys(modals)
  }, [modals])

  useEffect(() => {
    modalIdsRef.current.forEach((modalId) => {
      void hide(modalId)
    })
  }, [pathname, search])

  return null
}

const NiceModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <Suspense fallback={null}>
        <NiceModalRouteChangeHandler />
      </Suspense>
      {children}
    </Provider>
  )
}

export default NiceModalProvider
