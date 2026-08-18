const numberFormat = new Intl.NumberFormat('en-US')
const oneDecimalFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
})
const shortDateTimeFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatCount(value: number): string {
  return numberFormat.format(value)
}

export function formatDecimal(value: number | null, suffix = ''): string {
  return value === null ? '—' : `${oneDecimalFormat.format(value)}${suffix}`
}

export function formatMagnitude(value: number | null): string {
  return value === null ? 'M —' : `M ${oneDecimalFormat.format(value)}`
}

export function formatDateTime(value: string | Date | null): string {
  return value === null ? '—' : dateTimeFormat.format(new Date(value))
}

export function formatShortDateTime(value: string | Date | null): string {
  return value === null ? '—' : shortDateTimeFormat.format(new Date(value))
}

export function formatRelativeTime(value: string | Date, now = new Date()): string {
  const differenceSeconds = (new Date(value).getTime() - now.getTime()) / 1_000
  const absoluteSeconds = Math.abs(differenceSeconds)

  if (absoluteSeconds < 60) {
    return relativeTimeFormat.format(Math.round(differenceSeconds), 'second')
  }
  if (absoluteSeconds < 3_600) {
    return relativeTimeFormat.format(Math.round(differenceSeconds / 60), 'minute')
  }
  if (absoluteSeconds < 86_400) {
    return relativeTimeFormat.format(Math.round(differenceSeconds / 3_600), 'hour')
  }
  return relativeTimeFormat.format(Math.round(differenceSeconds / 86_400), 'day')
}

export function magnitudeTone(magnitude: number | null): 'unknown' | 'low' | 'medium' | 'high' | 'major' {
  if (magnitude === null) return 'unknown'
  if (magnitude >= 6) return 'major'
  if (magnitude >= 4.5) return 'high'
  if (magnitude >= 3) return 'medium'
  return 'low'
}

export function magnitudeColor(magnitude: number | null): string {
  switch (magnitudeTone(magnitude)) {
    case 'major':
      return '#622b14'
    case 'high':
      return '#995f2f'
    case 'medium':
      return '#978f66'
    case 'low':
      return '#4f5848'
    default:
      return '#858675'
  }
}

export function markerRadius(magnitude: number | null): number {
  if (magnitude === null) return 5
  return Math.max(5, Math.min(22, 3 + magnitude * 2.4))
}

export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function coordinate(value: number, positive: string, negative: string): string {
  const direction = value >= 0 ? positive : negative
  return `${Math.abs(value).toFixed(3)}° ${direction}`
}
