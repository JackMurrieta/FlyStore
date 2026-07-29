import { Link } from 'react-router-dom'
import { useFlyRack, FlyRackCards, FlyRackControls } from '../../components/fly-rack/FlyRack'
import { Anuncios } from '../../components/anuncios/Anuncios'
import './home.css'

function FlipFly() {
  return (
    <>
      {'FLY'.split('').map((ch, i) => (
        <span className="flip-letter" key={i}>
          <i style={{ animationDelay: `${i * 70}ms` }}>{ch}</i>
        </span>
      ))}
    </>
  )
}

export function HomePage() {
  const rack = useFlyRack()

  return (
    <main className="home-root">

      <section className="home-split" aria-label="FLY Store">

        {/* ── Izquierda ── */}
        <div className="home-left">
          <div className="home-left-wrapper">

            <div className="home-hero">
              <div className="tiny">Ciudad Obregón · Sonora · México</div>
              <h1>
                Donde más<br />
                si no es en <em><FlipFly /></em>
              </h1>
              <p>Moda, fragancias y estilo de vida premium.</p>
            </div>

            <div className="home-actions">
              <Link to="/login" className="home-btn-primary">
                Explorar tienda
              </Link>
            </div>

          </div>
        </div>

        {/* ── Derecha ── */}
        <div className="home-right">
          <div className="home-right-wrapper">

            {/* Tarjetas */}
            <div className="home-right-cards">
              <FlyRackCards {...rack} />
            </div>

            {/* Dots + chips */}
            <div className="home-right-controls">
              <FlyRackControls {...rack} />
            </div>

          </div>
        </div>

      </section>

      {/* ── Anuncios ── */}
      <Anuncios />

      {/* ── Footer ── */}
      <footer className="home-footer">
        <nav className="home-footer-links" aria-label="Legal">
          <Link to="/privacidad" className="home-footer-link">Privacidad</Link>
          <Link to="/terminos" className="home-footer-link">Términos</Link>
        </nav>
        <p className="home-footer-copy">
          © {new Date().getFullYear()} FLY Store · Ciudad Obregón, Sonora
        </p>
      </footer>

    </main>
  )
}
