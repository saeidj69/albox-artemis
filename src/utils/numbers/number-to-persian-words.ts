/**
 * Converts a number to Persian words
 * Example: 1150000 => "یک میلیون و صد و پنجاه هزار"
 */

const ones = [
  '',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
]

const tens = [
  '',
  '',
  'بیست',
  'سی',
  'چهل',
  'پنجاه',
  'شصت',
  'هفتاد',
  'هشتاد',
  'نود',
]

const hundreds = [
  '',
  'صد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
]

const scales = ['', 'هزار', 'میلیون', 'میلیارد']

function convertThreeDigits(num: number): string {
  if (num === 0) return ''

  const h = Math.floor(num / 100)
  const t = Math.floor((num % 100) / 10)
  const o = num % 10
  const parts: string[] = []

  if (h > 0) {
    parts.push(hundreds[h])
  }

  if (num % 100 < 20) {
    if (num % 100 > 0) {
      parts.push(ones[num % 100])
    }
  } else {
    if (t > 0) {
      parts.push(tens[t])
    }
    if (o > 0) {
      parts.push(ones[o])
    }
  }

  return parts.join(' و ')
}

export function numberToPersianWords(num: number): string {
  if (num === 0) return 'صفر'
  if (num < 0) return 'منفی ' + numberToPersianWords(-num)

  // Handle numbers up to billions
  const parts: string[] = []
  let scaleIndex = 0

  while (num > 0) {
    const chunk = num % 1000
    if (chunk > 0) {
      const chunkWords = convertThreeDigits(chunk)
      if (scales[scaleIndex]) {
        parts.unshift(chunkWords + ' ' + scales[scaleIndex])
      } else {
        parts.unshift(chunkWords)
      }
    }
    num = Math.floor(num / 1000)
    scaleIndex++
  }

  return parts.join(' و ')
}

export function numberToPersianWordsWithRial(num: number): string {
  return numberToPersianWords(num) + ' ریال'
}
