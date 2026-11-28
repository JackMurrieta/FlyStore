/**
 * Capa de animación global de la tienda (FLY Motion).
 * Se monta una sola vez dentro del router; cada director es independiente
 * y solo lee atributos data-fly-* del DOM, sin tocar el estado de la app.
 */

import { AppleMotionDirector } from './AppleMotionDirector'
import { MotionDirector } from './MotionDirector'
import { SharedProductMotion } from './SharedProductMotion'
import { StoreMotionRuntime } from './StoreMotionRuntime'
import { UltraMotionDirector } from './UltraMotionDirector'

export function MotionRaiz() {
  return (
    <>
      <MotionDirector />
      <AppleMotionDirector />
      <UltraMotionDirector />
      <StoreMotionRuntime />
      <SharedProductMotion />
    </>
  )
}
