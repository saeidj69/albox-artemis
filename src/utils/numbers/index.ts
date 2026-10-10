export const englishDigits = (value: string) => {
  // Support both Persian (۰-۹) and Arabic (٠-٩) digits
  return value.replace(/[۰-۹٠-٩]/g, (d) => {
    const persian = '۰۱۲۳۴۵۶۷۸۹'
    const arabic = '٠١٢٣٤٥٦٧٨٩'
    const idxPersian = persian.indexOf(d)
    if (idxPersian !== -1) return String(idxPersian)
    const idxArabic = arabic.indexOf(d)
    if (idxArabic !== -1) return String(idxArabic)
    return d
  })
}

export const persianDigits = (value: string | number | undefined | null) => {
  if (value == null || value === '') {
    return ''
  }

  const valueToCheck = typeof value === 'number' ? String(value) : value

  return valueToCheck.replace(/[0-9]/g, (d) => {
    const persian = '۰۱۲۳۴۵۶۷۸۹'
    return persian[parseInt(d, 10)]
  })
}

export const onlyDigits = (value: string) => {
  const acceptedCharacters = '1234567890'
  return value
    .split('')
    .filter((char) => acceptedCharacters.includes(char))
    .join('')
}

export const formatPrice = (value: number) => {
  return value.toLocaleString('fa-IR')
}

export const toTomanPrice = (value: number) => {
  return Math.round(value / 10)
}
