/**
 * Grid de productos destacados
 * Muestra 4 productos en grid responsive
 */

import { Texto } from '@compartido/ui/Texto'
import { ProductCard } from './ProductCard'
import styles from './ProductGrid.module.css'

// Productos de ejemplo (datos temporales)
const productosDestacados = [
  { id: 1, nombre: 'Gorra Clásica', precio: 450, slug: 'gorra-clasica' },
  { id: 2, nombre: 'Tenis Deportivos', precio: 1299, slug: 'tenis-deportivos' },
  { id: 3, nombre: 'Perfume Premium', precio: 899, slug: 'perfume-premium' },
  { id: 4, nombre: 'Sudadera Urban', precio: 750, slug: 'sudadera-urban' },
]

export function ProductGrid() {
  return (
    <section className={styles.section}>
      {/* Título de sección */}
      <div className={styles.header}>
        <Texto variante="h2">Productos destacados</Texto>
        <Texto variante="cuerpo" tono="secundario">
          Descubre nuestra selección especial
        </Texto>
      </div>

      {/* Grid de productos */}
      <div className={styles.grid}>
        {productosDestacados.map((producto) => (
          <ProductCard
            key={producto.id}
            nombre={producto.nombre}
            precio={producto.precio}
            slug={producto.slug}
          />
        ))}
      </div>
    </section>
  )
}
