/**
 * Tarjeta de categoría
 * Componente reutilizable para mostrar líneas de producto
 */

import { Link } from 'react-router-dom'
import styles from './CategoryCard.module.css'

interface CategoryCardProps {
  readonly nombre: string
  /** Ruta de la línea (CU-01 · B2: primero las marcas de la línea). */
  readonly ruta: string
  readonly imagen: string
}

export function CategoryCard({ nombre, ruta, imagen }: CategoryCardProps) {
  return (
    <Link viewTransition data-fly-card data-fly-reveal to={ruta} className={styles.card}>
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
