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

function pipelineStatusCopy(status: IngestionRun['status'] | undefined) {
  switch (status) {
    case 'RUNNING':
      return 'Receiving'
    case 'FAILED':
      return 'Needs attention'
    case 'SUCCEEDED':
      return 'Archive current'
    default:
      return 'Standing by'
  }
}

export function IngestionPanel({ runs }: IngestionPanelProps) {
  const latest = runs[0]
  const latestTone = latest?.status.toLowerCase() ?? 'idle'

  return (
    <section
      className={`panel ingestion-panel ingestion-panel--${latestTone}`}
      aria-label="Data ingestion history"
    >
      <header className="ingestion-header">
        <div>
          <span className="eyebrow">Dossier 04 / station activity</span>
          <h2>Sync ledger</h2>
        </div>
        <span
          className={`pipeline-state pipeline-state--${latestTone}`}
          aria-label={`Latest pipeline status: ${humanizeEnum(latest?.status ?? 'IDLE')}`}
        >
          <i aria-hidden="true" />
          <span>
            <small>Latest state</small>
            <strong>{pipelineStatusCopy(latest?.status)}</strong>
          </span>
        </span>
      </header>

      <div className="ingestion-register" aria-hidden="true">
        <span>Automated transfer log</span>
        <b>{runs.length.toString().padStart(2, '0')} entries</b>
      </div>

      {runs.length > 0 ? (
        <div className="run-list">
          {runs.map((run, index) => (
            <article
              className={`run-row run-row--${run.status.toLowerCase()}`}
              key={run.id}
              aria-label={`Ingestion run ${run.id}: ${humanizeEnum(run.status)}`}
            >
              <div className="run-index" aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <i className="run-icon">
                  <RunStatusIcon run={run} />
                </i>
              </div>

              <div className="run-copy">
                <header>
                  <span>
                    <strong>{humanizeEnum(run.source)}</strong>
                    <small>Run / {run.id}</small>
                  </span>
                  <time dateTime={run.startedAt}>{formatRelativeTime(run.startedAt)}</time>
                </header>

                {run.status === 'FAILED' ? (
                  <p className="run-error">{run.errorMessage ?? 'The transfer did not complete.'}</p>
                ) : (
                  <dl className="run-metrics">
                    <div>
                      <dt>Seen</dt>
                      <dd>{formatCount(run.processed)}</dd>
                    </div>
                    <div>
                      <dt>New</dt>
                      <dd>{formatCount(run.inserted)}</dd>
                    </div>
                    <div>
                      <dt>Changed</dt>
                      <dd>{formatCount(run.updated)}</dd>
                    </div>
                    <div>
                      <dt>Same</dt>
                      <dd>{formatCount(run.unchanged)}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ingestion-empty">
          <span className="ingestion-empty-mark" aria-hidden="true">
            <DatabaseIcon />
            <i />
          </span>
          <span className="eyebrow">Log 00 / no transfers</span>
          <strong>No field notes yet.</strong>
          <p>The first ingestion run will leave its receipt here when the station comes online.</p>
        </div>
      )}
    </section>
  )
}
