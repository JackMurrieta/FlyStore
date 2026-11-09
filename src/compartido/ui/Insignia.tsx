import { type ReactNode } from 'react'
import estilos from './Insignia.module.css'

export type TonoInsignia = 'neutro' | 'info' | 'advertencia' | 'exito' | 'error'

export interface InsigniaProps {
  readonly tono: TonoInsignia
  readonly children: ReactNode
}

/**
 * Componente de insignia (badge) del sistema de diseño FLY
 *
 * @example
 * <Insignia tono="exito">Disponible</Insignia>
 * <Insignia tono="advertencia">Agotado</Insignia>
 */
export function Insignia({ tono, children }: InsigniaProps) {
  return <span className={`${estilos.insignia} ${estilos[tono]}`}>{children}</span>
}
