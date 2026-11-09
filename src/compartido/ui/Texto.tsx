import { type ReactNode, createElement, type HTMLAttributes } from 'react'

export type VarianteTexto =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'precio-l'
  | 'cuerpo'
  | 'cuerpo-s'
  | 'etiqueta'
  | 'etiqueta-fuerte'
  | 'precio'
  | 'sobretitulo'
  | 'boton'
  | 'mini'

export type TonoTexto = 'principal' | 'secundario'

type ElementoHTML = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'

export interface TextoProps extends HTMLAttributes<HTMLElement> {
  readonly variante: VarianteTexto
  readonly como?: ElementoHTML
  readonly tono?: TonoTexto
  readonly children: ReactNode
}

/**
 * Componente de texto que aplica los estilos tipográficos de FLY B/N
 *
 * @example
 * <Texto variante="h1" como="h1">Título principal</Texto>
 * <Texto variante="cuerpo" como="p" tono="secundario">Descripción</Texto>
 */
export function Texto({
  variante,
  como = 'span',
  tono = 'principal',
  children,
  className = '',
  ...props
}: TextoProps) {
  const claseVariante = `fly-${variante}`
  const claseTono = `fly-tono-${tono}`
  const claseCompleta = `${claseVariante} ${claseTono} ${className}`.trim()

  return createElement(como, { className: claseCompleta, ...props }, children)
}
