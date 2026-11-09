/**
 * Banners promocionales horizontales
 * 3 banners pequeños para ofertas o información
 */

import { Link } from 'react-router-dom'
import { Texto } from '@compartido/ui/Texto'
import styles from './PromoBanners.module.css'

// Datos de ejemplo
const banners = [
  { id: 1, titulo: 'Envío gratis', descripcion: 'En compras mayores a $500', enlace: '/envios' },
  { id: 2, titulo: 'Garantía extendida', descripcion: '12 meses en todos los productos', enlace: '/garantia' },
  { id: 3, titulo: 'Atención 24/7', descripcion: 'Soporte vía WhatsApp', enlace: '/contacto' },
]

export function PromoBanners() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {banners.map((banner) => (
          <Link key={banner.id} to={banner.enlace} className={styles.banner}>
            <Texto variante="etiqueta-fuerte" className={styles.titulo}>
              {banner.titulo}
            </Texto>
            <Texto variante="mini" tono="secundario" className={styles.descripcion}>
              {banner.descripcion}
            </Texto>
          </Link>
        ))}
      </div>
    </section>
  )
}
