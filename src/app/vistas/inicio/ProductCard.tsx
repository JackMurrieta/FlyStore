/**
 * Tarjeta de producto destacado
 * Componente reutilizable para mostrar productos
 */

import { Link } from 'react-router-dom'
import { Texto } from '@compartido/ui/Texto'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  readonly nombre: string
  readonly precio: number
  readonly slug: string
}

export function ProductCard({ nombre, precio, slug }: ProductCardProps) {
  const precioFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(precio)

  return (
    <Link to={`/productos/${slug}`} className={styles.card}>
      {/* Placeholder para imagen de producto */}
      <div className={styles.imagenProducto} />

      {/* Overlay con gradiente */}
      <div className={styles.overlay} />

      {/* Información del producto */}
      <div className={styles.info}>
        <Texto variante="etiqueta-fuerte" className={styles.nombre}>
          {nombre}
        </Texto>
        <Texto variante="precio" className={styles.precio}>
          {precioFormateado}
        </Texto>
      </div>
    </Link>
  )
}
