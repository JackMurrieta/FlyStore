/**
 * Componente Radio del sistema de diseño FLY
 */

import { type InputHTMLAttributes, useId } from 'react'
import { Texto } from './Texto'
import estilos from './Radio.module.css'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  readonly etiqueta: string
  readonly descripcion?: string
}

/**
 * Componente de radio button
 *
 * @example
 * <Radio
 *   name="tipo_cliente"
 *   value="BASE"
 *   etiqueta="Cliente Base"
 *   descripcion="Precios regulares"
 *   checked={seleccion === 'BASE'}
 *   onChange={(e) => setSeleccion(e.target.value)}
 * />
 */
export function Radio({ etiqueta, descripcion, disabled, ...props }: RadioProps) {
  const id = useId()

  return (
    <label htmlFor={id} className={`${estilos.contenedor} ${disabled ? estilos.deshabilitado : ''}`}>
      <input id={id} type="radio" className={estilos.input} disabled={disabled} {...props} />
      <div className={estilos.radio}>
        <div className={estilos.radioMarca} />
      </div>
      <div className={estilos.contenido}>
        <Texto variante="etiqueta-fuerte">{etiqueta}</Texto>
        {descripcion && (
          <Texto variante="mini" tono="secundario">
            {descripcion}
          </Texto>
        )}
      </div>
    </label>
  )
}
