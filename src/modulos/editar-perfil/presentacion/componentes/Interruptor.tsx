import estilos from './perfil.module.css'

/**
 * Interruptor (switch) accesible: botón con role="switch" y aria-checked.
 * El texto visible es la etiqueta; el estado se dice con «Activado/Desactivado» además del color.
 */
export function Interruptor({ activo, etiqueta, descripcion, ocupado, alCambiar }: {
  readonly activo: boolean
  readonly etiqueta: string
  readonly descripcion?: string
  readonly ocupado?: boolean
  readonly alCambiar: () => void
}) {
  return (
    <button type="button" role="switch" aria-checked={activo} aria-busy={ocupado} disabled={ocupado}
      className={estilos.interruptor} onClick={alCambiar}>
      <span className={estilos.pista} aria-hidden="true"><span className={estilos.perilla} /></span>
      <span className={estilos.textoInterruptor}>
        <span className="fly-etiqueta-fuerte">{etiqueta}</span>
        {descripcion && <span className="fly-mini fly-tono-secundario">{descripcion}</span>}
      </span>
    </button>
  )
}
