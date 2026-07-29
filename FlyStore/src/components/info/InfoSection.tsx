import { useState } from 'react'
import './InfoSection.css'

const FAQS = [
  {
    q: '¿Cómo hago un pedido?',
    a: 'Elige el producto que te guste, agrégalo al carrito y confirma por WhatsApp. Te respondemos de inmediato para coordinar pago y envío.',
  },
  {
    q: '¿Hacen envíos?',
    a: 'Sí. Enviamos a toda la República Mexicana en 3 a 7 días hábiles. Te compartimos tu número de rastreo por WhatsApp en cuanto sale tu pedido.',
  },
  {
    q: '¿Cómo funciona el mayoreo?',
    a: 'Todo nuestro catálogo está disponible desde 1 pieza. Crea tu cuenta para acceder a precios especiales y ver tu historial de pedidos.',
  },
]

export function InfoSection() {
  const [openIdx, setOpenIdx] = useState(-1)

  const toggle = (i: number) =>
    setOpenIdx(prev => (prev === i ? -1 : i))

  return (
    <section className="info-root" aria-label="Sobre FLY Store y preguntas frecuentes">
      <div className="info-wrapper">

        {/* ── Sobre FLY Store ── */}
        <div className="info-col">
          <div className="info-label">Sobre FLY Store</div>

          <div className="info-about-wrap">
            <div className="info-about-card">

              {/* Ícono decorativo */}
              <div className="info-about-icon" aria-hidden="true">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor"
                     strokeWidth="1.2" strokeLinecap="round">
                  <circle cx="20" cy="20" r="17"/>
                  <path d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8"/>
                  <path d="M20 28v-8M20 16v-1"/>
                </svg>
              </div>

              <p className="info-about-text">
                Somos una tienda <strong>100% digital</strong> en{' '}
                <strong>Ciudad Obregón, Sonora</strong>. Trabajamos directo con
                proveedores para traerte gorras premium, perfumes árabes
                originales y ropa de calidad. Sin intermediarios, precio justo.
              </p>

              <ul className="info-about-pills" aria-label="Categorías">
                <li>Gorras Premium</li>
                <li>Perfumes Árabes</li>
                <li>Ropa de Calidad</li>
              </ul>

            </div>
          </div>
        </div>

        {/* ── Preguntas frecuentes ── */}
        <div className="info-col">
          <div className="info-label">Preguntas frecuentes</div>

          <div className="info-faq-wrap">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`info-faq-item${openIdx === i ? ' open' : ''}`}
              >
                <button
                  className="info-faq-q"
                  onClick={() => toggle(i)}
                  type="button"
                  aria-expanded={openIdx === i}
                >
                  <span>{faq.q}</span>
                  <span className="info-faq-arr" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <polyline points="2 4 6 8 10 4"/>
                    </svg>
                  </span>
                </button>
                <div className="info-faq-a">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
