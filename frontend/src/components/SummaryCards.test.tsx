import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { EarthquakeSummary } from '../types'
import { SummaryCards } from './SummaryCards'

const summary: EarthquakeSummary = {
  totalEvents: 1234,
  eventsWithMagnitude: 1111,
  averageMagnitude: 2.7,
  maximumMagnitude: 6.4,
  tsunamiEvents: 3,
  averageDepthKm: 18.34,
  earliestOccurredAt: '2026-08-12T00:00:00Z',
  latestOccurredAt: '2026-08-12T20:00:00Z',
  strongestEarthquake: {
    usgsId: 'test-event',
    magnitude: 6.4,
    place: 'South Sandwich Islands region',
    occurredAt: '2026-08-12T18:00:00Z',
  },
}

describe('SummaryCards', () => {
  it('prints the filtered catalog readings', () => {
    render(<SummaryCards summary={summary} />)

    const report = screen.getByRole('region', { name: 'Earthquake summary' })

    expect(within(report).getByText('1,234')).toBeInTheDocument()
    expect(within(report).getByText('1,111 with reported magnitude')).toBeInTheDocument()
    expect(within(report).getByText('M 6.4')).toBeInTheDocument()
    expect(within(report).getByText('South Sandwich Islands region')).toBeInTheDocument()
    expect(within(report).getByText('18.3 km')).toBeInTheDocument()
    expect(within(report).getByText('0.2% of this survey')).toBeInTheDocument()
  })
})
