import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Earthquake } from '../types'
import { EventList } from './EventList'

const events: Earthquake[] = [
  {
    usgsId: 'first-event',
    magnitude: 4.8,
    place: '90 km SE of Sand Point, Alaska',
    occurredAt: '2026-08-13T12:00:00Z',
    sourceUpdatedAt: '2026-08-13T12:01:00Z',
    longitude: -159.4,
    latitude: 54.7,
    depthKm: 33.1,
    alert: null,
    status: 'automatic',
    significance: 312,
    tsunami: true,
    detailUrl: 'https://earthquake.usgs.gov/',
    firstSeenAt: '2026-08-13T12:01:00Z',
    lastSeenAt: '2026-08-13T12:01:00Z',
  },
  {
    usgsId: 'second-event',
    magnitude: 2.3,
    place: 'The Geysers, California',
    occurredAt: '2026-08-13T11:00:00Z',
    sourceUpdatedAt: '2026-08-13T11:01:00Z',
    longitude: -122.8,
    latitude: 38.8,
    depthKm: 4.7,
    alert: null,
    status: 'reviewed',
    significance: 81,
    tsunami: false,
    detailUrl: 'https://earthquake.usgs.gov/',
    firstSeenAt: '2026-08-13T11:01:00Z',
    lastSeenAt: '2026-08-13T11:01:00Z',
  },
]

describe('EventList', () => {
  it('renders a numbered ledger and selects an event', () => {
    const onSelect = vi.fn()
    render(
      <EventList
        earthquakes={events}
        total={12}
        selectedId="second-event"
        onSelect={onSelect}
      />,
    )

    const ledger = screen.getByRole('region', { name: 'Recent earthquakes' })
    const rows = within(ledger).getAllByRole('button')

    expect(within(rows[0]).getByText('01')).toBeInTheDocument()
    expect(within(rows[1]).getByText('02')).toBeInTheDocument()
    expect(rows[1]).toHaveAttribute('aria-pressed', 'true')
    expect(within(ledger).getByText('Ledger shows the newest 2 of 12 matching events.')).toBeInTheDocument()

    fireEvent.click(rows[0])
    expect(onSelect).toHaveBeenCalledWith(events[0])
  })
})
