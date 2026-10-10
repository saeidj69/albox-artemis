import { useMediaMatch } from 'rooks'

export const useIsDesktop = () => {
  return useMediaMatch('(min-width: 720px)')
}
