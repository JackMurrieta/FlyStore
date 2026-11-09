import { type ReactNode } from 'react'
import { Icono } from './iconos/Icono'
import estilos from './Chip.module.css'

export interface ChipProps {
  readonly activo: boolean
  readonly removible?: boolean
  readonly children: ReactNode
  readonly onClick?: () => void
  readonly onRemover?: () => void
}

/**
 * Componente de chip (filtro o etiqueta seleccionable) del sistema de diseño FLY
 *
 * @example
 * <Chip activo={filtroActivo} onClick={() => setFiltroActivo(!filtroActivo)}>
 *   Gorras
 * </Chip>
 *
 * <Chip
 *   activo
 *   removible
 *   onRemover={() => eliminarFiltro('gorras')}
 * >
 *   Gorras
 * </Chip>
 */
export function Chip({ activo, removible = false, children, onClick, onRemover }: ChipProps) {
  const clases = `${estilos.chip} ${activo ? estilos.activo : estilos.inactivo}`

  return (
    <button
      type="button"
      className={clases}
      onClick={onClick}
      aria-pressed={activo}
    >
      {children}
      {removible && onRemover && (
        <button
          type="button"
          className={estilos.botonRemover}
          onClick={(e) => {
            e.stopPropagation()
            onRemover()
          }}
          aria-label="Remover filtro"
        >
          <Icono nombre="x" tamano={16} />
        </button>
      )}
    </button>
  )
}
