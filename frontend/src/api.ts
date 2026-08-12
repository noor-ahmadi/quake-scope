import type {
  DashboardSnapshot,
  EarthquakeFilters,
  EarthquakePage,
  EarthquakeSummary,
  IngestionResult,
  IngestionRunPage,
  TimeRange,
} from './types'

const RANGE_MILLISECONDS: Record<Exclude<TimeRange, 'all'>, number> = {
  '1h': 60 * 60 * 1_000,
  '24h': 24 * 60 * 60 * 1_000,
  '7d': 7 * 24 * 60 * 60 * 1_000,
  '30d': 30 * 24 * 60 * 60 * 1_000,
}

interface ProblemDetails {
  detail?: string
  title?: string
}

interface HealthResponse {
  status?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let problem: ProblemDetails | undefined
    try {
      problem = (await response.json()) as ProblemDetails
    } catch {
      // A proxy or infrastructure error may not return JSON.
    }

    throw new ApiError(
      problem?.detail ?? problem?.title ?? `Request failed with status ${response.status}`,
      response.status,
    )
  }

  return (await response.json()) as T
}

export function buildEarthquakeParams(filters: EarthquakeFilters, now = new Date()): URLSearchParams {
  const params = new URLSearchParams({
    page: '0',
    size: '100',
    sort: 'occurredAt,desc',
  })

  if (filters.timeRange !== 'all') {
    params.set(
      'occurredAfter',
      new Date(now.getTime() - RANGE_MILLISECONDS[filters.timeRange]).toISOString(),
    )
  }

  const minMagnitude = filters.minMagnitude.trim()
  if (minMagnitude !== '') {
    params.set('minMagnitude', minMagnitude)
  }

  if (filters.tsunamiOnly) {
    params.set('tsunami', 'true')
  }

  if (filters.status) {
    params.set('status', filters.status)
  }

  const place = filters.place.trim()
  if (place) {
    params.set('placeContains', place)
  }

  return params
}

export async function fetchDashboard(
  filters: EarthquakeFilters,
  now = new Date(),
): Promise<DashboardSnapshot> {
  const eventParams = buildEarthquakeParams(filters, now)
  const summaryParams = new URLSearchParams(eventParams)
  summaryParams.delete('page')
  summaryParams.delete('size')
  summaryParams.delete('sort')

  const healthPromise = requestJson<HealthResponse>('/actuator/health')
    .then((health) => (health.status === 'UP' ? 'UP' : 'DOWN') as DashboardSnapshot['health'])
    .catch(() => 'DOWN' as const)

  const [earthquakes, summary, ingestionRuns, health] = await Promise.all([
    requestJson<EarthquakePage>(`/api/v1/earthquakes?${eventParams}`),
    requestJson<EarthquakeSummary>(`/api/v1/earthquakes/summary?${summaryParams}`),
    requestJson<IngestionRunPage>('/api/v1/ingestion-runs?page=0&size=8&sort=startedAt,desc'),
    healthPromise,
  ])

  return {
    earthquakes,
    summary,
    ingestionRuns,
    health,
    loadedAt: new Date(),
  }
}

export function refreshFeed(): Promise<IngestionResult> {
  return requestJson<IngestionResult>('/api/v1/ingestion-runs/refresh', {
    method: 'POST',
  })
}
