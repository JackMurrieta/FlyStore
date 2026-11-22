import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Posición de cada entrada del historial de la tienda (clave de react-router → scrollY). */
const posiciones = new Map<string, number>()
const MAX_POSICIONES = 50

/**
 * Desplazamiento de la tienda: al abrir otra página (catálogo → ficha) empieza arriba; con
 * «Regresar» o el botón Atrás vuelve a donde estaba, por ejemplo a la tarjeta que se abrió.
 * Cambiar filtros u orden no mueve la página (cambian los parámetros, no la ruta).
 */
export function useDesplazamientoTienda(): void {
  const { key, pathname } = useLocation()
  const tipo = useNavigationType()

  useLayoutEffect(() => {
    if (typeof window.scrollTo !== 'function') return
    const guardada = posiciones.get(key)
    if (tipo === 'POP' && guardada !== undefined) restaurar(guardada)
    else window.scrollTo(0, 0)
    // Solo al cambiar de página; los filtros reemplazan la entrada sin cambiar la ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useLayoutEffect(() => {
    const guardar = () => {
      posiciones.set(key, window.scrollY)
      if (posiciones.size > MAX_POSICIONES) posiciones.delete(posiciones.keys().next().value as string)
    }
    window.addEventListener('scroll', guardar, { passive: true })
    return () => window.removeEventListener('scroll', guardar)
  }, [key])
}

/** Espera a que el contenido (que puede venir de la caché o de la red) alcance la altura necesaria. */
function restaurar(y: number): void {
  let intentos = 0
  const paso = () => {
    const maximo = document.documentElement.scrollHeight - window.innerHeight
    if (maximo >= y || intentos++ > 30) {
      window.scrollTo(0, Math.min(y, Math.max(0, maximo)))
      return
    }
    requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}
