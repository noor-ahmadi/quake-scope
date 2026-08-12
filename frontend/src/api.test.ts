import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildEarthquakeParams, fetchDashboard, refreshFeed } from './api'
import { DEFAULT_FILTERS } from './types'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildEarthquakeParams', () => {
  it('builds the default 24-hour query', () => {
    const params = buildEarthquakeParams(DEFAULT_FILTERS, new Date('2026-08-12T18:00:00Z'))

    expect(params.get('occurredAfter')).toBe('2026-08-11T18:00:00.000Z')
    expect(params.get('size')).toBe('100')
    expect(params.get('sort')).toBe('occurredAt,desc')
    expect(params.has('minMagnitude')).toBe(false)
  })

  it('normalizes optional filters and omits the all-time boundary', () => {
    const params = buildEarthquakeParams({
      timeRange: 'all',
      minMagnitude: ' 4.5 ',
      tsunamiOnly: true,
      status: 'reviewed',
      place: ' Japan ',
    })

    expect(params.has('occurredAfter')).toBe(false)
    expect(params.get('minMagnitude')).toBe('4.5')
    expect(params.get('tsunami')).toBe('true')
    expect(params.get('status')).toBe('reviewed')
    expect(params.get('placeContains')).toBe('Japan')
  })
})

describe('dashboard API', () => {
  it('loads earthquakes, summary, runs, and health together', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      calls.push(url)

      if (url.startsWith('/api/v1/earthquakes/summary')) {
        return Response.json({ totalEvents: 0 })
      }
      if (url.startsWith('/api/v1/earthquakes?')) {
        return Response.json({ content: [], page: { totalElements: 0 } })
      }
      if (url.startsWith('/api/v1/ingestion-runs')) {
        return Response.json({ content: [], page: { totalElements: 0 } })
      }
      return Response.json({ status: 'UP' })
    }))

    const snapshot = await fetchDashboard(DEFAULT_FILTERS, new Date('2026-08-12T18:00:00Z'))

    expect(snapshot.health).toBe('UP')
    expect(snapshot.earthquakes.content).toEqual([])
    expect(calls).toHaveLength(4)
    expect(calls.find((url) => url.includes('/summary'))).not.toContain('sort=')
  })

  it('exposes problem details and status codes for failed refreshes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(
      { detail: 'Another ingestion is already running' },
      { status: 409 },
    )))

    await expect(refreshFeed()).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Another ingestion is already running',
      status: 409,
    })
  })
})
