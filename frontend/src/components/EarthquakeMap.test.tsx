import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Earthquake } from '../types'
import { EarthquakeMap } from './EarthquakeMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, minZoom }: { children: ReactNode; minZoom: number }) => (
    <div data-testid="leaflet-map" data-min-zoom={minZoom}>{children}</div>
  ),
  Marker: ({
    children,
    eventHandlers,
    icon,
    title,
    zIndexOffset,
  }: {
    children: ReactNode
    eventHandlers: { click: () => void }
    icon: { options: { className?: string } }
    title: string
    zIndexOffset: number
  }) => (
    <button
      type="button"
      aria-label={title}
      data-marker-class={icon.options.className}
      data-z-index={zIndexOffset}
      onClick={eventHandlers.click}
    >
      {children}
    </button>
  ),
  TileLayer: () => null,
  Tooltip: ({ children, permanent }: { children: ReactNode; permanent: boolean }) => (
    <div data-permanent={permanent}>{children}</div>
  ),
  useMap: () => ({
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
  }),
}))

afterEach(cleanup)

const events: Earthquake[] = [
  {
    usgsId: 'major-event',
    magnitude: 6.2,
    place: 'South Sandwich Islands',
    occurredAt: '2026-08-16T18:00:00Z',
    sourceUpdatedAt: '2026-08-16T18:02:00Z',
    longitude: -26.3,
    latitude: -58.8,
    depthKm: 18.4,
    alert: 'green',
    status: 'reviewed',
    significance: 615,
    tsunami: false,
    detailUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/major-event',
    firstSeenAt: '2026-08-16T18:02:00Z',
    lastSeenAt: '2026-08-16T18:02:00Z',
  },
  {
    usgsId: 'minor-event',
    magnitude: 2.7,
    place: 'Central Alaska',
    occurredAt: '2026-08-16T17:00:00Z',
    sourceUpdatedAt: '2026-08-16T17:01:00Z',
    longitude: -149.9,
    latitude: 61.2,
    depthKm: 42.1,
    alert: null,
    status: 'automatic',
    significance: 112,
    tsunami: false,
    detailUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/minor-event',
    firstSeenAt: '2026-08-16T17:01:00Z',
    lastSeenAt: '2026-08-16T17:01:00Z',
  },
]

describe('EarthquakeMap', () => {
  it('plots field marks, locks the selected event, and preserves selection behavior', () => {
    const onSelect = vi.fn()
    render(
      <EarthquakeMap earthquakes={events} selectedId="major-event" onSelect={onSelect} />,
    )

    const atlas = screen.getByRole('region', { name: 'Earthquake map' })
    expect(within(atlas).getByRole('heading', { name: 'Live atlas' })).toBeInTheDocument()
    expect(within(atlas).getByText('2', { selector: '.map-count b' })).toBeInTheDocument()
    expect(within(atlas).getByTestId('leaflet-map')).toHaveAttribute('data-min-zoom', '0')

    const selectedMark = within(atlas).getByRole('button', { name: 'M 6.2 — South Sandwich Islands' })
    expect(selectedMark).toHaveAttribute('data-marker-class', expect.stringContaining('is-selected'))
    expect(selectedMark).toHaveAttribute('data-z-index', '1000')
    expect(within(selectedMark).getByText('Observation 01')).toBeInTheDocument()

    const nextMark = within(atlas).getByRole('button', { name: 'M 2.7 — Central Alaska' })
    fireEvent.click(nextMark)
    expect(onSelect).toHaveBeenCalledWith(events[1])
  })
})
