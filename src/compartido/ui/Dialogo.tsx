import { type ReactNode, useEffect, useId, useRef } from 'react'
import { Icono, type NombreIcono } from './iconos/Icono'
import { Texto } from './Texto'
import estilos from './Dialogo.module.css'

export interface DialogoProps {
  readonly abierto: boolean
  readonly alCerrar: () => void
  readonly titulo: string
  readonly icono?: NombreIcono
  readonly children: ReactNode
  readonly alineacion?: 'centro' | 'izquierda'
  readonly tonoIcono?: 'neutro' | 'peligro'
}

/**
 * Componente de diálogo modal del sistema de diseño FLY
 *
 * @example
 * <Dialogo
 *   abierto={mostrarDialogo}
 *   alCerrar={() => setMostrarDialogo(false)}
 *   titulo="CONFIRMAR ACCIÓN"
 *   icono="alert-triangle"
 * >
 *   <p>¿Estás seguro de que deseas continuar?</p>
 *   <Boton onClick={confirmar}>Confirmar</Boton>
 * </Dialogo>
 */
export function Dialogo({ abierto, alCerrar, titulo, icono, children, alineacion = 'centro', tonoIcono = 'neutro' }: DialogoProps) {
  const tituloId = useId()
  const dialogoRef = useRef<HTMLDivElement>(null)
  const botonCerrarRef = useRef<HTMLButtonElement>(null)

  // Trampa de foco
  useEffect(() => {
    if (!abierto) return

    const elementoAnterior = document.activeElement as HTMLElement

    // Enfocar el botón de cerrar cuando se abre
    botonCerrarRef.current?.focus()

    // Manejar tecla Escape
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        alCerrar()
      }
    }

    // Trampa de foco dentro del diálogo
    const manejarTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogoRef.current) return

      const elementosEnfocables = dialogoRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )

      const primerElemento = elementosEnfocables[0]
      const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === primerElemento) {
          ultimoElemento?.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === ultimoElemento) {
          primerElemento?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', manejarEscape)
    document.addEventListener('keydown', manejarTab)

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', manejarEscape)
      document.removeEventListener('keydown', manejarTab)
      document.body.style.overflow = ''

      // Devolver foco al elemento anterior
      elementoAnterior?.focus()
    }
  }, [abierto, alCerrar])

  if (!abierto) return null

  const manejarClicVelo = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      alCerrar()
    }
  }

  return (
    <div className={estilos.velo} onClick={manejarClicVelo} role="dialog" aria-modal="true" aria-labelledby={tituloId}>
      <div className={`${estilos.dialogo} ${alineacion === 'izquierda' ? estilos.izquierda : ''}`} ref={dialogoRef}>
        <button
          ref={botonCerrarRef}
          className={estilos.botonCerrar}
          onClick={alCerrar}
          aria-label="Cerrar diálogo"
        >
          <Icono nombre="x" tamano={20} />
        </button>

        <div className={estilos.encabezado}>
          {icono && (
            <div className={`${estilos.iconoCirculo} ${tonoIcono === 'peligro' ? estilos.peligro : ''}`}>
              <Icono nombre={icono} tamano={24} aria-hidden="true" />
            </div>
          )}
          <Texto variante="h2" como="h2" className={estilos.titulo}>
            <span id={tituloId}>{titulo}</span>
          </Texto>
        </div>

        <div className={estilos.contenido}>{children}</div>
      </div>
    </div>
  )
}
