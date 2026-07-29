import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './Proceso.css'

const STEPS = [
  {
    num: '01',
    title: 'Inicia sesión',
    desc: 'Crea tu cuenta o inicia sesión para guardar favoritos y agilizar tu próxima compra.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Elige tu producto',
    desc: 'Explora gorras, ropa, fragancias y calzado premium. Encuentra lo que más te guste.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Confirma por WhatsApp',
    desc: 'Agrégalo al carrito y escríbenos. Te respondemos de inmediato para coordinar tu pedido.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Pago y envío',
    desc: 'Coordinamos el método de pago y el envío a tu domicilio, o recoge en tienda en Cd. Obregón.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
]

/* Altura de cada botón de ícono: 72px icon + 10px*2 padding = 92px */
const BTN_H = 92
/* Padding top del wrapper de íconos */
const WRAP_PT = 4

export function Proceso() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible,      setVisible]      = useState(false)
  const [activeStep,   setActiveStep]   = useState(0)   // ícono activo + posición
  const [shownStep,    setShownStep]    = useState(0)   // contenido visible
  const [fading,       setFading]       = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleStepClick = (i: number) => {
    if (i === activeStep || fading) return
    setActiveStep(i)   // el ícono se activa de inmediato y la posición viaja
    setFading(true)    // inicia fade-out del contenido
    setTimeout(() => {
      setShownStep(i)  // actualiza el texto ya en la nueva posición
      setFading(false) // inicia fade-in
    }, 200)
  }

  /* top del panel de contenido alineado con el ícono activo */
  const contentTop = WRAP_PT + activeStep * BTN_H + 10 /* btn padding-top */

  return (
    <section className="proceso-root" ref={sectionRef} aria-label="Proceso de compra">
      <div className="proceso-wrapper">

        <div className="proceso-header-wrap">
          <p className="proceso-eyebrow">Comprar en FLY</p>
          <h2 className="proceso-title">Así de fácil</h2>
        </div>

        {/* ── Desktop: grid 4 columnas ── */}
        <div className="proceso-steps-wrap">
          {STEPS.map((step, i) => (
            <article
              key={step.num}
              className={`proceso-step${visible ? ' visible' : ''}`}
              style={{ '--step-delay': `${i * 0.12}s` } as CSSProperties}
            >
              <div className="proceso-step-icon-wrap">
                <span className="proceso-step-num" aria-hidden="true">{step.num}</span>
                <div className="proceso-step-icon" aria-hidden="true">{step.icon}</div>
              </div>
              <div className="proceso-step-body">
                <h3 className="proceso-step-title">{step.title}</h3>
                <p className="proceso-step-desc">{step.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* ── Mobile / Tablet: íconos verticales + contenido flotante ── */}
        <div className="proceso-mobile" role="tablist" aria-label="Pasos de compra">

          {/* Columna izquierda — íconos apilados */}
          <div className="proceso-mobile-icons">
            {STEPS.map((step, i) => (
              <button
                key={step.num}
                className={`proceso-mobile-icon-btn${i === activeStep ? ' active' : ''}`}
                onClick={() => handleStepClick(i)}
                role="tab"
                aria-selected={i === activeStep}
                aria-controls="proceso-mobile-panel"
                aria-label={step.title}
                type="button"
              >
                <div className="proceso-step-icon-wrap">
                  <span className="proceso-step-num" aria-hidden="true">{step.num}</span>
                  <div className="proceso-step-icon" aria-hidden="true">{step.icon}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Panel de contenido — se posiciona junto al ícono activo */}
          <div
            id="proceso-mobile-panel"
            className={`proceso-mobile-content${fading ? ' fading' : ''}`}
            style={{ top: contentTop } as CSSProperties}
            role="tabpanel"
            aria-label={STEPS[shownStep].title}
          >
            <p className="proceso-mobile-step-label">Paso {STEPS[shownStep].num}</p>
            <h3 className="proceso-step-title">{STEPS[shownStep].title}</h3>
            <p className="proceso-step-desc">{STEPS[shownStep].desc}</p>
          </div>

        </div>

      </div>
    </section>
  )
}
