/**
 * Grid de líneas de producto (categorías)
 * Muestra las categorías principales del catálogo
 */

import { Texto } from '@compartido/ui/Texto'
import { CategoryCard } from './CategoryCard'
import styles from './CategoryGrid.module.css'

// Importar imágenes de categorías
import imageGorras from '../../../assets/index/gorras.webp'
import imagePerfumes from '../../../assets/index/essentials.webp'
import imageTenis from '../../../assets/index/tenis.webp'
import imageRopa from '../../../assets/index/clothes.webp'

// Categorías principales de FlyStore
const categorias = [
  { id: 'gorras', nombre: 'Gorras', slug: 'gorras', imagen: imageGorras },
  { id: 'perfumes', nombre: 'Perfumes', slug: 'perfumes', imagen: imagePerfumes },
  { id: 'tenis', nombre: 'Tenis', slug: 'tenis', imagen: imageTenis },
  { id: 'ropa', nombre: 'Ropa', slug: 'ropa', imagen: imageRopa },
]

export function CategoryGrid() {
  return (
    <section className={styles.section}>
      {/* Título de sección */}
      <div className={styles.header}>
        <Texto variante="h2">Nuestras líneas de producto</Texto>
        <Texto variante="cuerpo" tono="secundario">
          Explora nuestras categorías
        </Texto>
      </div>

      {/* Grid de categorías */}
      <div className={styles.grid}>
        {categorias.map((categoria) => (
          <CategoryCard
            key={categoria.id}
            nombre={categoria.nombre}
            slug={categoria.slug}
            imagen={categoria.imagen}
          />
        ))}
      </div>
    </section>
  )
}
