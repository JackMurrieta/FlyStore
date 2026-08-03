// src/pages/tienda/caps.tsx

import './store.css'

export function FlyEssencePage() {
  return (
    <main className="store-page">
      <section className="store-hero">
        <span className="store-tag">FLY Store</span>

        <h1>FLY Caps</h1>

        <p>
          Essence
        </p>
      </section>

      <section className="store-content">
        <div className="store-placeholder">
          <h2>Catálogo en construcción</h2>

          <p>
            Aquí se mostrarán las gorras disponibles con filtros, búsqueda,
            categorías y productos destacados.
          </p>
        </div>
      </section>
    </main>
  )
}