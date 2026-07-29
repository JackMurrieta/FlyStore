import { useState, useEffect, useRef } from 'react'
import './Anuncios.css'

const ADS = [
  { src: '/anuncios/flyCaps_ad1.jpeg',  alt: 'FlyCaps — Colección' },
  { src: '/anuncios/flyCaps_ad2.jpeg',  alt: 'FlyCaps — Nuevos estilos' },
  { src: '/anuncios/flyEssential.jpeg', alt: 'FlyEssence — Fragancias' },
]

export function Anuncios() {
  const [active, setActive]   = useState(0)
  const [paused, setPaused]   = useState(false)
  const drag = useRef({ on: false, startX: 0, dx: 0 })

  const go = (i: number) =>
    setActive(((i % ADS.length) + ADS.length) % ADS.length)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() =>
      setActive(prev => (prev + 1) % ADS.length), 4500)
    return () => clearInterval(id)
  }, [paused])

  const onStart = (x: number) => {
    drag.current = { on: true, startX: x, dx: 0 }
  }
  const onMove = (x: number) => {
    if (!drag.current.on) return
    drag.current.dx = x - drag.current.startX
  }
  const onEnd = () => {
    if (!drag.current.on) return
    drag.current.on = false
    if (drag.current.dx < -50)      go(active + 1)
    else if (drag.current.dx > 50)  go(active - 1)
    drag.current.dx = 0
  }

  return (
    <section className="ads-root" aria-label="Anuncios">
      <div className="ads-wrapper">

        <div className="ads-header-wrap">
          <p className="ads-eyebrow">Esta semana</p>
          <h2 className="ads-title">Anuncios</h2>
        </div>

        <div
          className="ads-carousel-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); onEnd() }}
          onMouseDown={e  => onStart(e.clientX)}
          onMouseMove={e  => onMove(e.clientX)}
          onMouseUp={onEnd}
          onTouchStart={e => onStart(e.touches[0].clientX)}
          onTouchMove={e  => { e.preventDefault(); onMove(e.touches[0].clientX) }}
          onTouchEnd={onEnd}
        >
          <div
            className="ads-track"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {ADS.map((ad, i) => (
              <div className="ads-slide" key={i}>
                <img
                  src={ad.src}
                  alt={ad.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="ads-controls-wrap">
          <div className="ads-dots" role="tablist" aria-label="Anuncios">
            {ADS.map((_, i) => (
              <button
                key={i}
                className={`ads-dot${i === active ? ' active' : ''}`}
                onClick={() => go(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={`Anuncio ${i + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
