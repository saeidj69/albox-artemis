import { cn } from '@/lib/utils'

interface SafeInsetProps {
  direction: 'top' | 'bottom'
}

const SafeInset = (props: SafeInsetProps) => {
  const { direction } = props

  return (
    <div
      className={cn(
        direction === 'bottom' ? 'h-safe-bottom' : 'h-safe-top',
        'transition-all duration-300',
      )}
    />
  )
}

export default SafeInset
