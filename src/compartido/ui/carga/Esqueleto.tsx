import type { CSSProperties, ReactNode } from 'react'
import estilos from './Carga.module.css'

export type FormaEsqueleto = 'bloque' | 'texto' | 'titulo' | 'circulo' | 'pastilla'

export interface EsqueletoProps {
  readonly forma?: FormaEsqueleto
  /** Ancho CSS (número = px). Por defecto 100%. */
  readonly ancho?: number | string
  /** Alto CSS (número = px). Los textos y títulos ya tienen alto. */
  readonly alto?: number | string
  readonly className?: string
}

/** Pieza de esqueleto con brillo. Decorativa: el texto accesible lo da <CargaContenido>. */
export function Esqueleto({ forma = 'bloque', ancho, alto, className }: EsqueletoProps) {
  const estilo: CSSProperties = {
    width: ancho ?? '100%',
    ...(alto !== undefined ? { height: alto } : {}),
    ...(forma === 'circulo' && alto === undefined ? { height: ancho } : {}),
  }
  return <span aria-hidden="true" data-forma={forma} className={`${estilos.esqueleto} ${className ?? ''}`.trim()} style={estilo} />
}

/** Párrafo de esqueleto: varias líneas, la última más corta. */
export function EsqueletoTexto({ lineas = 3, ultima = '60%' }: { readonly lineas?: number; readonly ultima?: string }) {
  return (
    <span className={estilos.lineas} aria-hidden="true">
      {Array.from({ length: lineas }, (_, i) => (
        <Esqueleto key={i} forma="texto" ancho={i === lineas - 1 && lineas > 1 ? ultima : '100%'} />
      ))}
    </span>
  )
}

/**
 * Región que anuncia la carga a lectores de pantalla (role="status") y muestra los esqueletos.
 * Úsala alrededor de cualquier composición de esqueletos.
 */
export function CargaContenido({ texto, children, className }: {
  readonly texto: string
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className={estilos.textoOculto}>{texto}</span>
      {children}
    </div>
  )
}
