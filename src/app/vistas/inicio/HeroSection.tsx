/**
 * Sección Hero de la página de inicio
 * Carrusel automático con navegación manual
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import styles from './HeroSection.module.css'

// Importar imágenes del carrusel
import carrusel1 from '../../../assets/carrusel/carrusel1.webp'
import carrusel2 from '../../../assets/carrusel/carrusel2.webp'
import carrusel3 from '../../../assets/carrusel/carrusel3.webp'
import carrusel4 from '../../../assets/carrusel/carrusel4.webp'
import carrusel5 from '../../../assets/carrusel/carrusel5.webp'

const imagenes = [carrusel1, carrusel2, carrusel3, carrusel4, carrusel5]

export function HeroSection() {
  const [indiceActual, setIndiceActual] = useState(0)

  // Avanzar automáticamente cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((prevIndice) => (prevIndice + 1) % imagenes.length)
    }, 5000)

    return () => clearInterval(intervalo)
  }, [])

  const irASlide = (indice: number) => {
    setIndiceActual(indice)
  }

  const siguiente = () => {
    setIndiceActual((prevIndice) => (prevIndice + 1) % imagenes.length)
  }

  const anterior = () => {
    setIndiceActual((prevIndice) =>
      prevIndice === 0 ? imagenes.length - 1 : prevIndice - 1
    )
  }

  return (
    <section className={styles.hero}>
      {/* Carrusel de imágenes */}
      <div className={styles.carruselContainer}>
        {imagenes.map((imagen, indice) => (
          <div
            key={indice}
            className={`${styles.slide} ${
              indice === indiceActual ? styles.slideActivo : ''
            }`}
            style={{ backgroundImage: `url(${imagen})` }}
          />
        ))}
      </div>

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

      {/* Controles de navegación */}
      <button
        onClick={anterior}
        className={`${styles.navBoton} ${styles.navAnterior}`}
        aria-label="Imagen anterior"
      >
        ‹
      </button>
      <button
        onClick={siguiente}
        className={`${styles.navBoton} ${styles.navSiguiente}`}
        aria-label="Siguiente imagen"
      >
        ›
      </button>

      {/* Indicadores de navegación */}
      <div className={styles.indicadores}>
        {imagenes.map((_, indice) => (
          <button
            key={indice}
            onClick={() => irASlide(indice)}
            className={`${styles.dot} ${
              indice === indiceActual ? styles.activo : ''
            }`}
            aria-label={`Ir a imagen ${indice + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
