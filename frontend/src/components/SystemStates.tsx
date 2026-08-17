import { motion } from 'motion/react'
import { ActivityIcon, AlertIcon, CheckIcon, CloseIcon, RefreshIcon } from './Icons'

type ToastTone = 'success' | 'error'

interface RetryNoticeProps {
  message: string
  onRetry: () => void
}

interface ToastNoticeProps {
  tone: ToastTone
  text: string
  onDismiss: () => void
}

const editorialEase = [0.22, 1, 0.36, 1] as const

const stateEntrance = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: editorialEase },
}

export function LoadingDashboard() {
  return (
    <motion.section
      className="loading-dashboard"
      aria-label="Loading earthquake data"
      role="status"
      {...stateEntrance}
    >
      <header className="transmission-register">
        <span>Field transmission / incoming</span>
        <b>QS — live</b>
      </header>

      <div className="loading-dashboard__body">
        <div className="loading-target" aria-hidden="true">
          <span />
          <i />
          <ActivityIcon />
        </div>
        <div className="loading-dashboard__copy">
          <span className="eyebrow">Catalog link / acquiring</span>
          <h2>Listening for the latest movement.</h2>
          <p>Opening a line to the seismic catalog and plotting the last 24 hours.</p>
        </div>
      </div>

      <div className="transmission-meter" aria-hidden="true">
        <span><i /></span>
        <b>Receiving field data</b>
      </div>
    </motion.section>
  )
}

export function UpdateError({ message, onRetry }: RetryNoticeProps) {
  return (
    <motion.aside
      className="error-banner"
      role="alert"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: editorialEase }}
    >
      <span className="error-banner__index">TX / 01</span>
      <span className="error-banner__mark" aria-hidden="true"><AlertIcon /></span>
      <span className="error-banner__copy">
        <small>Catalog link interrupted</small>
        <strong>Last good survey is still on the table.</strong>
        <span>{message}</span>
      </span>
      <button type="button" onClick={onRetry}>
        Retry link <RefreshIcon />
      </button>
    </motion.aside>
  )
}

export function FatalState({ message, onRetry }: RetryNoticeProps) {
  return (
    <motion.section className="fatal-state" role="alert" {...stateEntrance}>
      <header className="transmission-register">
        <span>Field transmission / unavailable</span>
        <b>Signal — lost</b>
      </header>

      <div className="fatal-state__body">
        <div className="fatal-target" aria-hidden="true">
          <i />
          <i />
          <AlertIcon />
        </div>
        <div className="fatal-state__copy">
          <span className="eyebrow">Catalog link / no response</span>
          <h2>No signal from the station.</h2>
          <p>{message}</p>
          <button type="button" onClick={onRetry}>
            <RefreshIcon /> Reopen the line
          </button>
        </div>
      </div>

      <div className="fatal-state__note">
        <span>Check / API</span>
        <span>Check / database</span>
        <span>Check / local network</span>
      </div>
    </motion.section>
  )
}

export function ToastNotice({ tone, text, onDismiss }: ToastNoticeProps) {
  const success = tone === 'success'

  return (
    <motion.aside
      className={`toast toast--${tone}`}
      role="status"
      initial={{ opacity: 0, y: 18, rotate: -0.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: editorialEase }}
    >
      <span className="toast__index">{success ? 'OK' : 'ERR'}</span>
      <span className="toast__mark" aria-hidden="true">
        {success ? <CheckIcon /> : <AlertIcon />}
      </span>
      <span className="toast__copy">
        <small>{success ? 'Field dispatch / received' : 'Field dispatch / interrupted'}</small>
        <strong>{text}</strong>
      </span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        <CloseIcon />
      </button>
    </motion.aside>
  )
}
