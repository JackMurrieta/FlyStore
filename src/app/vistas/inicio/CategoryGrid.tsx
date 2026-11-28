/**
 * Grid de líneas de producto (categorías)
 * Muestra las categorías principales del catálogo
 */

import { Texto } from '@compartido/ui/Texto'
import { CATEGORIAS } from '@compartido/config/marca'
import { CategoryCard } from './CategoryCard'
import styles from './CategoryGrid.module.css'

// Líneas de FlyStore en el orden del inicio. Al elegir una se ven primero sus marcas (CU-01 · B2).
const ORDEN = ['caps', 'essence', 'shoes', 'clothes'] as const
const categorias = ORDEN.map((clave) => CATEGORIAS.find((c) => c.clave === clave)!)

export function CategoryGrid() {
  return (
    <section className={styles.section}>
      {/* Título de sección */}
      <div data-fly-editorial className={styles.header}>
        <Texto variante="h2">Nuestras líneas de producto</Texto>
        <Texto variante="cuerpo" tono="secundario">
          Explora nuestras categorías
        </Texto>
      </div>

      {/* Grid de categorías */}
      <div className={styles.grid}>
        {categorias.map((categoria) => (
          <CategoryCard
            key={categoria.clave}
            nombre={categoria.titulo}
            ruta={categoria.ruta}
            imagen={categoria.imagen}
          />
        ))}
      </div>
    </section>
  )
}
