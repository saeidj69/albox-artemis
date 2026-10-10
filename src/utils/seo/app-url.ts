const value = process.env.APP_URL

if (!value) {
  throw new Error('APP_URL environment variable is required')
}

export const appUrl = new URL(value)
