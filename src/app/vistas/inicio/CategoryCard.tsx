/**
 * Tarjeta de categoría
 * Componente reutilizable para mostrar líneas de producto
 */

import { Link } from 'react-router-dom'
import styles from './CategoryCard.module.css'

interface CategoryCardProps {
  readonly nombre: string
  readonly slug: string
  readonly imagen: string
}

export function CategoryCard({ nombre, slug, imagen }: CategoryCardProps) {
  return (
    <Link to={`/productos?categoria=${slug}`} className={styles.card}>
      {/* Imagen de fondo de categoría */}
      <div
        className={styles.imagenCategoria}
        style={{ backgroundImage: `url(${imagen})` }}
      />

      {/* Overlay con gradiente */}
      <div className={styles.overlay} />

      {/* Información de la categoría */}
      <div className={styles.info}>
        <h3 className={styles.nombre}>{nombre}</h3>
      </div>
    </Link>
  )
}
