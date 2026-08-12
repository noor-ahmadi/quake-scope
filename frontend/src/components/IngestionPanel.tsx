import type { IngestionRun } from '../types'
import { formatCount, formatRelativeTime, humanizeEnum } from '../format'
import { CheckIcon, ClockIcon, DatabaseIcon } from './Icons'

interface IngestionPanelProps {
  runs: IngestionRun[]
}

function RunStatusIcon({ run }: { run: IngestionRun }) {
  if (run.status === 'SUCCEEDED') {
    return <CheckIcon />
  }
  if (run.status === 'RUNNING') {
    return <ClockIcon className="is-pulsing" />
  }
  return <span aria-hidden="true">!</span>
}

export function IngestionPanel({ runs }: IngestionPanelProps) {
  const latest = runs[0]

  return (
    <section className="panel ingestion-panel" aria-label="Data ingestion history">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Data pipeline</span>
          <h2>Ingestion activity</h2>
        </div>
        <span className={`pipeline-state pipeline-state--${latest?.status.toLowerCase() ?? 'idle'}`}>
          <span />
          {latest?.status === 'RUNNING' ? 'Syncing' : 'Operational'}
        </span>
      </div>

      {runs.length > 0 ? (
        <div className="run-list">
          {runs.map((run) => (
            <article className={`run-row run-row--${run.status.toLowerCase()}`} key={run.id}>
              <span className="run-icon">
                <RunStatusIcon run={run} />
              </span>
              <div className="run-copy">
                <div>
                  <strong>{humanizeEnum(run.source)}</strong>
                  <small>#{run.id}</small>
                </div>
                <p>
                  {run.status === 'FAILED'
                    ? run.errorMessage ?? 'The sync did not complete.'
                    : `${formatCount(run.processed)} processed · ${formatCount(run.inserted)} new · ${formatCount(run.updated)} updated`}
                </p>
              </div>
              <time dateTime={run.startedAt}>{formatRelativeTime(run.startedAt)}</time>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state--compact">
          <DatabaseIcon />
          <strong>Waiting for the first sync</strong>
          <p>Ingestion runs will appear here as the pipeline starts.</p>
        </div>
      )}
    </section>
  )
}
