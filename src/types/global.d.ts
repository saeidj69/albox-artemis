declare module '*.svg' {
  const content: string | { src: string; height: number; width: number }
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

interface Window {
  clarity?: (...args: unknown[]) => void
  plausible?: (
    event: string,
    options?: { props?: Record<string, unknown> },
  ) => void
  dataLayer?: Record<string, unknown>[]
  webengage?: {
    init?: (licenseCode: string) => void
    track?: (event: string, data?: Record<string, unknown>) => void
    user?: {
      login?: (userId: string) => void
      logout?: () => void
      identify?: (userId: string) => void
      setAttribute?: (attributes: Record<string, unknown>) => void
    }
  }
}
