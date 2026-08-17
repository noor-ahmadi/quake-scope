import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FatalState, LoadingDashboard, ToastNotice, UpdateError } from './SystemStates'

afterEach(cleanup)

describe('SystemStates', () => {
  it('announces an incoming catalog transmission', () => {
    render(<LoadingDashboard />)

    const status = screen.getByRole('status', { name: 'Loading earthquake data' })
    expect(within(status).getByText('Field transmission / incoming')).toBeInTheDocument()
    expect(within(status).getByRole('heading', { name: 'Listening for the latest movement.' })).toBeInTheDocument()
    expect(within(status).getByText('Receiving field data')).toBeInTheDocument()
  })

  it('keeps the last survey visible and lets the user retry an interrupted update', () => {
    const onRetry = vi.fn()
    render(<UpdateError message="The catalog timed out." onRetry={onRetry} />)

    const alert = screen.getByRole('alert')
    expect(within(alert).getByText('Last good survey is still on the table.')).toBeInTheDocument()
    expect(within(alert).getByText('The catalog timed out.')).toBeInTheDocument()

    fireEvent.click(within(alert).getByRole('button', { name: 'Retry link' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('explains a lost station signal and exposes recovery', () => {
    const onRetry = vi.fn()
    render(<FatalState message="The API did not answer." onRetry={onRetry} />)

    const alert = screen.getByRole('alert')
    expect(within(alert).getByRole('heading', { name: 'No signal from the station.' })).toBeInTheDocument()
    expect(within(alert).getByText('The API did not answer.')).toBeInTheDocument()

    fireEvent.click(within(alert).getByRole('button', { name: 'Reopen the line' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('prints and dismisses a field dispatch receipt', () => {
    const onDismiss = vi.fn()
    render(<ToastNotice tone="success" text="Catalog refreshed." onDismiss={onDismiss} />)

    const status = screen.getByRole('status')
    expect(within(status).getByText('Field dispatch / received')).toBeInTheDocument()
    expect(within(status).getByText('Catalog refreshed.')).toBeInTheDocument()

    fireEvent.click(within(status).getByRole('button', { name: 'Dismiss notification' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
