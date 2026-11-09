/**
 * Sección Hero de la página de inicio
 * Banner principal con CTA y navegación
 */

import { Link } from 'react-router-dom'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import styles from './HeroSection.module.css'

export function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Placeholder para imagen de fondo */}
      <div className={styles.imagenFondo} />

      {/* Overlay con gradiente */}
      <div className={styles.overlay} />

      {/* Contenido */}
      <div className={styles.contenido}>
        <Texto variante="display" className={styles.titulo}>
          Descubre nuestra colección
        </Texto>
        <Texto variante="cuerpo" tono="secundario" className={styles.subtitulo}>
          Encuentra productos de calidad para tu estilo
        </Texto>
        <Link to="/productos" className={styles.cta}>
          <Boton variante="primario">Ver productos</Boton>
        </Link>
      </div>

      {/* Indicadores de navegación */}
      <div className={styles.indicadores}>
        <div className={`${styles.dot} ${styles.activo}`} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </section>
  )
}
