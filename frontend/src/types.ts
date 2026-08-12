export type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all'

export interface EarthquakeFilters {
  timeRange: TimeRange
  minMagnitude: string
  tsunamiOnly: boolean
  status: string
  place: string
}

export interface PageMetadata {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface Earthquake {
  usgsId: string
  magnitude: number | null
  place: string | null
  occurredAt: string
  sourceUpdatedAt: string
  longitude: number
  latitude: number
  depthKm: number
  alert: string | null
  status: string
  significance: number
  tsunami: boolean
  detailUrl: string
  firstSeenAt: string
  lastSeenAt: string
}

export interface EarthquakePage {
  content: Earthquake[]
  page: PageMetadata
}

export interface StrongestEarthquake {
  usgsId: string
  magnitude: number | null
  place: string | null
  occurredAt: string
}

export interface EarthquakeSummary {
  totalEvents: number
  eventsWithMagnitude: number
  averageMagnitude: number | null
  maximumMagnitude: number | null
  tsunamiEvents: number
  averageDepthKm: number | null
  earliestOccurredAt: string | null
  latestOccurredAt: string | null
  strongestEarthquake: StrongestEarthquake | null
}

export type IngestionSource = 'LIVE_FEED' | 'MANUAL' | 'HISTORICAL'
export type IngestionStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED'

export interface IngestionRun {
  id: number
  source: IngestionSource
  startedAt: string
  completedAt: string | null
  rangeStart: string | null
  rangeEnd: string | null
  status: IngestionStatus
  processed: number
  inserted: number
  updated: number
  unchanged: number
  errorMessage: string | null
}

export interface IngestionRunPage {
  content: IngestionRun[]
  page: PageMetadata
}

export interface IngestionResult {
  processed: number
  inserted: number
  updated: number
  unchanged: number
}

export interface DashboardSnapshot {
  earthquakes: EarthquakePage
  summary: EarthquakeSummary
  ingestionRuns: IngestionRunPage
  health: 'UP' | 'DOWN' | 'UNKNOWN'
  loadedAt: Date
}

export const DEFAULT_FILTERS: EarthquakeFilters = {
  timeRange: '24h',
  minMagnitude: '',
  tsunamiOnly: false,
  status: '',
  place: '',
}
