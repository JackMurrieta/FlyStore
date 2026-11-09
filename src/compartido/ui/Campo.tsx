import { type InputHTMLAttributes, useState, useId } from 'react'
import { Icono } from './iconos/Icono'
import estilos from './Campo.module.css'

export interface CampoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  readonly etiqueta?: string
  readonly ayuda?: string
  readonly error?: string
}

/**
 * Componente de campo de entrada (input) del sistema de diseño FLY
 *
 * @example
 * <Campo
 *   etiqueta="Correo electrónico"
 *   type="email"
 *   ayuda="Usaremos tu correo para enviarte actualizaciones"
 *   value={correo}
 *   onChange={e => setCorreo(e.target.value)}
 * />
 *
 * <Campo
 *   etiqueta="Contraseña"
 *   type="password"
 *   error="La contraseña debe tener al menos 8 caracteres"
 *   value={contrasena}
 *   onChange={e => setContrasena(e.target.value)}
 * />
 */
export function Campo({ etiqueta, ayuda, error, type = 'text', disabled, ...props }: CampoProps) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const id = useId()
  const ayudaId = useId()
  const errorId = useId()

  const tipoReal = type === 'password' && mostrarContrasena ? 'text' : type
  const esContrasena = type === 'password'
  const tieneError = Boolean(error)
  const textoAyuda = error || ayuda

  return (
    <div className={estilos.contenedor}>
      {etiqueta && (
        <label htmlFor={id} className={estilos.etiqueta}>
          {etiqueta}
        </label>
      )}

      <div className={estilos.entradaContenedor}>
        <input
          id={id}
          type={tipoReal}
          className={`${estilos.entrada} ${tieneError ? estilos.entradaError : ''} ${esContrasena ? estilos.entradaConBoton : ''}`}
          aria-invalid={tieneError}
          aria-describedby={textoAyuda ? (tieneError ? errorId : ayudaId) : undefined}
          disabled={disabled}
          {...props}
        />

        {esContrasena && (
          <button
            type="button"
            className={estilos.botonMostrar}
            onClick={() => setMostrarContrasena(!mostrarContrasena)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            <Icono nombre="eye" tamano={20} />
          </button>
        )}
      </div>

      {textoAyuda && (
        <span
          id={tieneError ? errorId : ayudaId}
          className={`${estilos.ayuda} ${tieneError ? estilos.ayudaError : ''}`}
          role={tieneError ? 'alert' : undefined}
        >
          {tieneError && (
            <span className={estilos.iconoAyuda}>
              <Icono nombre="alert-circle" tamano={14} aria-hidden="true" />
            </span>
          )}
          {textoAyuda}
        </span>
      )}
    </div>
  )
}
