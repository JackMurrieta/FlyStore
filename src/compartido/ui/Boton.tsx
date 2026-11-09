import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import estilos from './Boton.module.css'

export type VarianteBoton =
  | 'primario'
  | 'secundario'
  | 'fantasma'
  | 'whatsapp'
  | 'peligro'
  | 'peligroSolido'

export interface BotonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  readonly variante?: VarianteBoton
  readonly icono?: ReactNode
  readonly cargando?: boolean
  readonly anchoCompleto?: boolean
  readonly children: ReactNode
}

/**
 * Componente de botón del sistema de diseño FLY
 *
 * @example
 * <Boton variante="primario" icono={<Icono nombre="user" />}>
 *   Iniciar sesión
 * </Boton>
 *
 * <Boton variante="secundario" cargando={procesando}>
 *   Guardar
 * </Boton>
 */
export function Boton({
  variante = 'primario',
  icono,
  cargando = false,
  anchoCompleto = false,
  disabled = false,
  children,
  ...props
}: BotonProps) {
  const clases = [
    estilos.boton,
    estilos[variante],
    anchoCompleto ? estilos.anchoCompleto : '',
    cargando ? estilos.cargando : '',
    disabled ? estilos.deshabilitado : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={clases}
      disabled={disabled || cargando}
      aria-busy={cargando}
      {...props}
    >
      {cargando && <span className={estilos.spinner} aria-hidden="true" />}
      {icono && <span aria-hidden="true">{icono}</span>}
      {children}
    </button>
  )
}
