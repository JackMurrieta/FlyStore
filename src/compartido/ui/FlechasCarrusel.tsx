/**
 * Flechas «anterior / siguiente» para carruseles y galerías (hero de inicio, foto del producto).
 *
 * Se pintan como hijas directas del contenedor (que debe tener position: relative y overflow: hidden):
 *  · Con mouse: ocultas fuera de su lugar; con el hover del contenedor entran deslizándose desde
 *    el borde y al salir el mouse regresan hacia afuera.
 *  · Con teclado: la flecha enfocada aparece.
 *  · En pantallas táctiles: siempre visibles (además del deslizamiento con el dedo).
 */

import { Icono } from './iconos/Icono'
import estilos from './FlechasCarrusel.module.css'

export type TamanoFlechas = 'grande' | 'mediano'

export interface FlechasCarruselProps {
  readonly alAnterior: () => void
  readonly alSiguiente: () => void
  readonly etiquetaAnterior: string
  readonly etiquetaSiguiente: string
  /** grande = hero (50 px, se reduce en móvil); mediano = galerías (40 px). */
  readonly tamano?: TamanoFlechas
}

export function FlechasCarrusel({
  alAnterior,
  alSiguiente,
  etiquetaAnterior,
  etiquetaSiguiente,
  tamano = 'grande',
}: FlechasCarruselProps) {
  const icono = tamano === 'grande' ? 28 : 22
  return (
    <>
      <button type="button" className={`${estilos.flecha} ${estilos.anterior} ${estilos[tamano]}`}
        onClick={alAnterior} aria-label={etiquetaAnterior}>
        <Icono nombre="chevron-left" tamano={icono} />
      </button>
      <button type="button" className={`${estilos.flecha} ${estilos.siguiente} ${estilos[tamano]}`}
        onClick={alSiguiente} aria-label={etiquetaSiguiente}>
        <Icono nombre="chevron-right" tamano={icono} />
      </button>
    </>
  )
}
