import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from './DashboardHeader'

afterEach(cleanup)

describe('DashboardHeader', () => {
  it('announces station health and starts a manual sync', () => {
    const onRefresh = vi.fn()
    render(
      <DashboardHeader
        health="UP"
        loadedAt={new Date()}
        refreshing={false}
        onRefresh={onRefresh}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Live system')
    const refresh = screen.getByRole('button', { name: 'Sync now' })
    expect(refresh).toHaveAttribute('aria-busy', 'false')

    fireEvent.click(refresh)
    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('locks the refresh control while a sync is running', () => {
    render(
      <DashboardHeader
        health="UNKNOWN"
        loadedAt={null}
        refreshing
        onRefresh={vi.fn()}
      />,
    )

    const refresh = screen.getByRole('button', { name: 'Syncing…' })
    expect(refresh).toBeDisabled()
    expect(refresh).toHaveAttribute('aria-busy', 'true')
  })
})
