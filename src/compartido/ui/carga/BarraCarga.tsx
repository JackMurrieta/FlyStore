import estilos from './Carga.module.css'

/**
 * Barra fina en la parte superior mientras carga una ruta o una respuesta larga.
 * No aparece si la carga dura menos de 150 ms. Decorativa: acompáñala de un texto accesible.
 */
export function BarraCarga() {
  return <div className={estilos.barra} aria-hidden="true" />
}
