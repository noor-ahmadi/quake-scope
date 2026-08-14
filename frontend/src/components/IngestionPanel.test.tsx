import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { IngestionRun } from '../types'
import { IngestionPanel } from './IngestionPanel'

afterEach(cleanup)

const runs: IngestionRun[] = [
  {
    id: 42,
    source: 'LIVE_FEED',
    startedAt: '2026-08-13T12:00:00Z',
    completedAt: null,
    rangeStart: null,
    rangeEnd: null,
    status: 'RUNNING',
    processed: 1234,
    inserted: 17,
    updated: 8,
    unchanged: 1209,
    errorMessage: null,
  },
  {
    id: 41,
    source: 'HISTORICAL',
    startedAt: '2026-08-13T10:00:00Z',
    completedAt: '2026-08-13T10:01:00Z',
    rangeStart: '2026-08-01T00:00:00Z',
    rangeEnd: '2026-08-13T00:00:00Z',
    status: 'FAILED',
    processed: 0,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    errorMessage: 'USGS archive did not answer in time.',
  },
]

describe('IngestionPanel', () => {
  it('prints a numbered station ledger and its latest state', () => {
    render(<IngestionPanel runs={runs} />)

    const panel = screen.getByRole('region', { name: 'Data ingestion history' })
    expect(within(panel).getByRole('heading', { name: 'Sync ledger' })).toBeInTheDocument()
    expect(within(panel).getByLabelText('Latest pipeline status: Running')).toHaveTextContent('Receiving')
    expect(within(panel).getByText('02 entries')).toBeInTheDocument()

    const running = within(panel).getByRole('article', { name: 'Ingestion run 42: Running' })
    expect(within(running).getByText('01')).toBeInTheDocument()
    expect(within(running).getByText('Live Feed')).toBeInTheDocument()
    expect(within(running).getByText('1,234')).toBeInTheDocument()
    expect(within(running).getByText('1,209')).toBeInTheDocument()

    const failed = within(panel).getByRole('article', { name: 'Ingestion run 41: Failed' })
    expect(within(failed).getByText('USGS archive did not answer in time.')).toBeInTheDocument()
  })

  it('keeps an idle receipt when there are no runs', () => {
    render(<IngestionPanel runs={[]} />)

    expect(screen.getByLabelText('Latest pipeline status: Idle')).toHaveTextContent('Standing by')
    expect(screen.getByText('00 entries')).toBeInTheDocument()
    expect(screen.getByText('No field notes yet.')).toBeInTheDocument()
  })
})
