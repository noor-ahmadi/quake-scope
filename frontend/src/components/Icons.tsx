import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function IconFrame({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ActivityIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M3 12h4l2.2-7 4 14 2.4-7H21" />
    </IconFrame>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </IconFrame>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 8.2A7 7 0 0 1 18.6 7L20 12M4 12l1.4 5a7 7 0 0 0 12.5-1.2" />
    </IconFrame>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </IconFrame>
  )
}

export function DepthIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 7h16M6.5 12h11M9 17h6" />
      <path d="m12 4 2 3-2 3-2-3 2-3Z" />
    </IconFrame>
  )
}

export function WaveIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M3 8.5c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
      <path d="M3 14.5c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
    </IconFrame>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconFrame>
  )
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </IconFrame>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconFrame>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconFrame>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M10.2 4 3.4 17a2 2 0 0 0 1.8 3h13.6a2 2 0 0 0 1.8-3L13.8 4a2 2 0 0 0-3.6 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </IconFrame>
  )
}

export function DatabaseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <ellipse cx="12" cy="5" rx="7.5" ry="3" />
      <path d="M4.5 5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5" />
      <path d="M4.5 11v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    </IconFrame>
  )
}
