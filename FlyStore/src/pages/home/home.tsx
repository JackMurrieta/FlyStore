import { Link } from 'react-router-dom'
import { FlyRack } from '../../components/fly-rack/FlyRack'
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
  return (
    <main className="home-root">

      <section className="home-split" aria-label="FLY Store">

        {/* ── Izquierda: hero ── */}
        <div className="home-left">
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

        {/* ── Derecha: carrusel ── */}
        <div className="home-right">
          <FlyRack />
        </div>

      </section>

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
