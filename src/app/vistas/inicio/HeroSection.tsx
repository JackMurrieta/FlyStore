/**
 * Sección Hero de la página de inicio
 * Carrusel automático con navegación manual: flechas (aparecen con el hover), puntos,
 * pausa y deslizamiento con el dedo. Animaciones FLY Motion siempre activas.
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import { FlechasCarrusel } from '@compartido/ui/FlechasCarrusel'
import styles from './HeroSection.module.css'

// Importar imágenes del carrusel
import carrusel1 from '../../../assets/carrusel/carrusel1.webp'
import carrusel2 from '../../../assets/carrusel/carrusel2.webp'
import carrusel3 from '../../../assets/carrusel/carrusel3.webp'
import carrusel4 from '../../../assets/carrusel/carrusel4.webp'
import carrusel5 from '../../../assets/carrusel/carrusel5.webp'

const imagenes = [carrusel1, carrusel2, carrusel3, carrusel4, carrusel5]

/** Desplazamiento mínimo (px) para tomar un gesto horizontal como «deslizar». */
const UMBRAL_GESTO = 50

export function HeroSection() {
  const [indiceActual, setIndiceActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const gesto = useRef<{ x: number; y: number } | null>(null)

  // Avanzar automáticamente cada 5 segundos (se reinicia al cambiar de imagen a mano)
  useEffect(() => {
    if (pausado) return
    const temporizador = setTimeout(() => {
      setIndiceActual((prevIndice) => (prevIndice + 1) % imagenes.length)
    }, 5000)

    return () => clearTimeout(temporizador)
  }, [indiceActual, pausado])

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
    <section
      data-fly-cinematic
      className={styles.hero}
      data-paused={pausado}
      onPointerDown={(e) => { if (e.pointerType === 'touch') gesto.current = { x: e.clientX, y: e.clientY } }}
      onPointerCancel={() => { gesto.current = null }}
      onPointerUp={(e) => {
        const inicio = gesto.current
        gesto.current = null
        if (!inicio) return
        const dx = e.clientX - inicio.x
        if (Math.abs(dx) > UMBRAL_GESTO && Math.abs(dx) > Math.abs(e.clientY - inicio.y) * 1.5) {
          if (dx < 0) siguiente()
          else anterior()
        }
      }}
    >
      {/* Carrusel de imágenes */}
      <div data-fly-parallax className={styles.carruselContainer}>
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

      {/* Contenido (título y subtítulo se vuelven a animar en cada imagen) */}
      <div className={styles.contenido}>
        <Texto key={`titulo-${indiceActual}`} variante="display" className={styles.titulo}>
          Descubre nuestra colección
        </Texto>
        <Texto key={`subtitulo-${indiceActual}`} variante="cuerpo" tono="secundario" className={styles.subtitulo}>
          Encuentra productos de calidad para tu estilo
        </Texto>
        <Link data-fly-magnetic viewTransition to="/categoria/caps" className={styles.cta}>
          <Boton variante="primario">Ver productos</Boton>
        </Link>
      </div>

      {/* Controles de navegación: entran con el hover */}
      <FlechasCarrusel
        alAnterior={anterior}
        alSiguiente={siguiente}
        etiquetaAnterior="Imagen anterior"
        etiquetaSiguiente="Siguiente imagen"
      />

      {/* Indicadores de navegación y pausa */}
      <div className={styles.indicadores}>
        <button
          type="button"
          className={styles.pausa}
          onClick={() => setPausado((valor) => !valor)}
          aria-label={pausado ? 'Reanudar carrusel' : 'Pausar carrusel'}
        >
          {pausado ? '▶' : 'Ⅱ'}
        </button>
        {imagenes.map((_, indice) => (
          <button
            key={`${indice}-${pausado}`}
            onClick={() => irASlide(indice)}
            className={`${styles.dot} ${
              indice === indiceActual ? styles.activo : ''
            }`}
            aria-label={`Ir a imagen ${indice + 1}`}
            aria-current={indice === indiceActual ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
