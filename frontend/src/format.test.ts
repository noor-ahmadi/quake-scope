import { describe, expect, it } from 'vitest'
import {
  coordinate,
  formatMagnitude,
  formatRelativeTime,
  humanizeEnum,
  magnitudeColor,
  markerRadius,
} from './format'

describe('earthquake formatting', () => {
  it('formats nullable magnitudes', () => {
    expect(formatMagnitude(4.26)).toBe('M 4.3')
    expect(formatMagnitude(null)).toBe('M —')
  })

  it('uses appropriate relative time units', () => {
    const now = new Date('2026-08-12T18:00:00Z')
    expect(formatRelativeTime('2026-08-12T17:58:00Z', now)).toBe('2 minutes ago')
    expect(formatRelativeTime('2026-08-11T18:00:00Z', now)).toBe('yesterday')
  })

  it('maps magnitude to bounded marker styling', () => {
    expect(magnitudeColor(6.2)).toBe('#171713')
    expect(magnitudeColor(2.1)).toBe('#1d6e73')
    expect(markerRadius(100)).toBe(22)
    expect(markerRadius(-3)).toBe(5)
  })

  it('humanizes enum values and coordinates', () => {
    expect(humanizeEnum('LIVE_FEED')).toBe('Live Feed')
    expect(coordinate(-33.862, 'N', 'S')).toBe('33.862° S')
  })
})
