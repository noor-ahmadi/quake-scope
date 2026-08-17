import { useEffect, useState, type CSSProperties } from 'react'

const sections = [
  { id: 'cover', index: '00', label: 'Cover' },
  { id: 'survey', index: '01', label: 'Survey' },
  { id: 'readings', index: '02', label: 'Readings' },
  { id: 'atlas', index: '03', label: 'Atlas' },
  { id: 'dossiers', index: '04', label: 'Dossiers' },
] as const

export function FieldIndex() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]['id']>('cover')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updatePosition = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)))

      const activationLine = window.innerWidth <= 740 ? 112 : 138
      let currentSection: (typeof sections)[number]['id'] = 'cover'

      sections.forEach(({ id }) => {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= activationLine) {
          currentSection = id
        }
      })

      setActiveSection(currentSection)
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [])

  return (
    <nav
      className="field-index"
      aria-label="Field index"
      style={{ '--field-progress': scrollProgress } as CSSProperties}
    >
      <span className="field-index__register" aria-hidden="true">
        Field index <i /> QS—26
      </span>
      <span className="field-index__links">
        {sections.map((section) => (
          <a
            href={`#${section.id}`}
            key={section.id}
            aria-label={`${section.index} ${section.label}`}
            aria-current={activeSection === section.id ? 'location' : undefined}
            onClick={() => setActiveSection(section.id)}
          >
            <b>{section.index}</b>
            <span>{section.label}</span>
          </a>
        ))}
      </span>
      <span className="field-index__progress" aria-hidden="true">
        <span><i /></span>
        Scroll / record
      </span>
    </nav>
  )
}
