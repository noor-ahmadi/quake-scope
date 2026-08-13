import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Earthquake } from '../types'
import { EventDetail } from './EventDetail'

afterEach(cleanup)

const earthquake: Earthquake = {
  usgsId: 'ak026efl7wc5',
  magnitude: 4.8,
  place: '90 km SE of Sand Point, Alaska',
  occurredAt: '2026-08-13T12:00:00Z',
  sourceUpdatedAt: '2026-08-13T12:01:00Z',
  longitude: -159.4,
  latitude: 54.7,
  depthKm: 33.1,
  alert: 'Green',
  status: 'reviewed',
  significance: 312,
  tsunami: true,
  detailUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/ak026efl7wc5',
  firstSeenAt: '2026-08-13T12:01:00Z',
  lastSeenAt: '2026-08-13T12:01:00Z',
}

describe('EventDetail', () => {
  it('renders the selected event as a field dossier', () => {
    const onClose = vi.fn()
    render(<EventDetail earthquake={earthquake} onClose={onClose} />)

    expect(screen.getByRole('region', { name: /details for 90 km se/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: earthquake.place! })).toBeInTheDocument()
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('33.1 km')).toBeInTheDocument()
    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Tsunami flag reported')).toBeInTheDocument()

    const sourceLink = screen.getByRole('link', { name: /open original event/i })
    expect(sourceLink).toHaveAttribute('href', earthquake.detailUrl)

    fireEvent.click(screen.getByRole('button', { name: /close event details/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('leaves an invitation when no event is selected', () => {
    render(<EventDetail earthquake={null} onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Pick a mark from the atlas.' })).toBeInTheDocument()
    expect(screen.getByText('Map marker / ledger row')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
