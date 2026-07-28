import { useState, useRef } from 'react'
import './FlyRack.css'

const CATS = [
  {
    key: 'caps', num: '01', name: 'FlyCaps', badge: 'Más vendido',
    sub: 'Barbas · Dandy · ThirtyOne · New Era',
    motif: (
      <svg viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M8 36C8 32 10 20 14 15C18 10 24 8 30 8s12 2 16 7c4 5 6 17 6 21"/>
        <line x1="5" y1="36" x2="55" y2="36"/>
        <path d="M5 36c0 5 2 9 7 9l14 0"/>
        <circle cx="30" cy="9" r="2.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    key: 'clothes', num: '02', name: 'FlyClothes', badge: null,
    sub: 'Calidad Turca · Fútbol Jugador',
    motif: (
      <svg viewBox="0 0 60 58" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 17L2 30l13 5v19h30V35l13-5L47 17Q40 23 30 23Q20 23 13 17Z"/>
      </svg>
    ),
  },
  {
    key: 'essence', num: '03', name: 'FlyEssence', badge: null,
    sub: 'Perfumes Árabes Originales · Decants',
    motif: (
      <svg viewBox="0 0 56 72" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <rect x="22" y="4" width="12" height="6" rx="3"/>
        <rect x="26" y="1" width="4" height="4" rx="2"/>
        <path d="M13 26C13 17 19 11 28 11s15 6 15 15v28c0 5.5-4 9-9 9H22c-5 0-9-3.5-9-9V26z"/>
      </svg>
    ),
  },
  {
    key: 'shoes', num: '04', name: 'FlyShoes', badge: 'Nuevo',
    sub: 'Tenis Urbanos · Próximamente',
    motif: (
      <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 30h56v6H2z"/>
        <path d="M2 30v-6c0-2 1-4 4-5l10-3 6-6c2-2 4-3 7-3h9c3 0 5 1.5 6 4l2 7c.6 2 2 3.2 4 4v8"/>
      </svg>
    ),
  },
]

function getPos(i: number, active: number): string {
  if (i === active)     return 'active'
  if (i === active - 1) return 'prev'
  if (i === active + 1) return 'next'
  return 'hidden'
}

export function FlyRack() {
  const [active, setActive] = useState(0)
  const dragRef  = useRef({ dragging: false, startX: 0, dx: 0 })
  const activeEl = useRef<HTMLDivElement | null>(null)

  const go = (next: number) => {
    setActive(Math.max(0, Math.min(CATS.length - 1, next)))
  }

  /* ── Drag handlers ── */
  const onDragStart = (x: number) => {
    dragRef.current = { dragging: true, startX: x, dx: 0 }
  }

  const onDragMove = (x: number) => {
    const d = dragRef.current
    if (!d.dragging) return
    d.dx = x - d.startX
    if (activeEl.current) {
      activeEl.current.style.transform =
        `translateX(${d.dx}px) rotate(${d.dx / 22}deg)`
    }
  }

  const onDragEnd = () => {
    const d = dragRef.current
    if (!d.dragging) return
    d.dragging = false
    if (activeEl.current) activeEl.current.style.transform = ''
    if (d.dx < -55 && active < CATS.length - 1) go(active + 1)
    else if (d.dx > 55 && active > 0)            go(active - 1)
    d.dx = 0
  }

  const handleCardClick = (pos: string) => {
    if (pos === 'prev') go(active - 1)
    if (pos === 'next') go(active + 1)
  }

  return (
    <div className="cat-list">
      {/* Rack */}
      <div
        className="rack-wrap"
        onMouseDown={e => { if (!(e.target as HTMLElement).closest('.tag-cta')) onDragStart(e.clientX) }}
        onMouseMove={e => onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={e => onDragStart(e.touches[0].clientX)}
        onTouchMove={e => onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
      >
        {CATS.map((cat, i) => {
          const pos = getPos(i, active)
          return (
            <div
              key={cat.key}
              className="tag glass"
              data-pos={pos}
              ref={pos === 'active' ? activeEl : null}
              onClick={() => handleCardClick(pos)}
            >
              {/* Motif de fondo */}
              <div className="tag-motif" aria-hidden="true">{cat.motif}</div>

              {/* Contenido */}
              <div className="tag-inner">
                <div>
                  <div className="tag-crest" aria-hidden="true">{cat.motif}</div>
                  <div className="tag-eyebrow">
                    COLECCIÓN N.{cat.num}{cat.badge ? ` · ${cat.badge}` : ''}
                  </div>
                  <div className="tag-name">{cat.name}</div>
                  <div className="tag-desc">{cat.sub}</div>
                </div>
                <button
                  className="tag-cta"
                  type="button"
                  onClick={e => { e.stopPropagation() }}
                >
                  Ver {cat.name} →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dots */}
      <div className="rack-dots" aria-hidden="true">
        {CATS.map((_, i) => (
          <div key={i} className={`rdot${i === active ? ' active' : ''}`} />
        ))}
      </div>

      {/* Jump chips */}
      <div className="jump-chips" role="tablist" aria-label="Categorías">
        {CATS.map((cat, i) => (
          <div
            key={cat.key}
            className={`jchip${i === active ? ' active' : ''}`}
            role="tab"
            aria-selected={i === active}
            tabIndex={0}
            onClick={() => go(i)}
            onKeyDown={e => e.key === 'Enter' && go(i)}
          >
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  )
}
