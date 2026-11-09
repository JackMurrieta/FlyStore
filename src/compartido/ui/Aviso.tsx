import { type ReactNode } from 'react'
import { Icono, type NombreIcono } from './iconos/Icono'
import estilos from './Aviso.module.css'

export type TonoAviso = 'neutro' | 'info' | 'advertencia' | 'exito' | 'error'

export interface AvisoProps {
  readonly tono: TonoAviso
  readonly titulo?: string
  readonly children: ReactNode
}

const ICONOS_POR_TONO: Record<Exclude<TonoAviso, 'neutro'>, NombreIcono> = {
  info: 'info',
  advertencia: 'alert-triangle',
  exito: 'check-circle',
  error: 'alert-circle',
}

/**
 * Componente de aviso (alert) del sistema de diseño FLY
 *
 * @example
 * <Aviso tono="exito" titulo="Operación exitosa">
 *   Tu pedido ha sido procesado correctamente
 * </Aviso>
 *
 * <Aviso tono="error">
 *   Hubo un problema al procesar tu solicitud
 * </Aviso>
 */
export function Aviso({ tono, titulo, children }: AvisoProps) {
  const nombreIcono = tono !== 'neutro' ? ICONOS_POR_TONO[tono] : undefined

  return (
    <div className={`${estilos.aviso} ${estilos[tono]}`} role="alert">
      {nombreIcono && (
        <div className={estilos.icono}>
          <Icono nombre={nombreIcono} tamano={20} aria-hidden="true" />
        </div>
      )}

      <div className={estilos.contenido}>
        {titulo && <p className={estilos.titulo}>{titulo}</p>}
        <div className={estilos.mensaje}>{children}</div>
      </div>
    </div>
  )
}
