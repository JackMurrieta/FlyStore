/**
 * ViewModels de los enlaces de cuenta por correo:
 * «Olvidé mi contraseña», «Restablecer contraseña» y la confirmación de enlaces (token_hash).
 */

import { useEffect, useRef, useState } from 'react'
import type { IAutenticacionService } from '../../dominio/puertos/IAutenticacionService'
import type { ConfirmacionCuentaTs } from '../../dominio/ConfirmacionCuentaTs'
import type { SesionModel } from '../../aplicacion/SesionModel'
import { type ErroresContrasena, validarContrasena } from '@compartido/reglas/contrasena'

const mensajeDe = (error: unknown, porDefecto: string) =>
  error instanceof Error && error.message ? error.message : porDefecto

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** «Olvidé mi contraseña». */
export function useRecuperarContrasena(servicio: IAutenticacionService) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const enviar = async (correo: string) => {
    if (!CORREO.test(correo.trim())) {
      setError('Escribe un correo válido')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      setMensaje(await servicio.recuperarContrasena(correo))
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos enviar el enlace. Inténtalo de nuevo.'))
    } finally {
      setEnviando(false)
    }
  }

  return { enviando, error, mensaje, enviar }
}

/** «Restablecer contraseña» (la sesión viene del enlace de recuperación). */
export function useRestablecerContrasena(servicio: IAutenticacionService) {
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<ErroresContrasena>({})
  const [error, setError] = useState<{ mensaje: string; vencido: boolean } | null>(null)
  const [listo, setListo] = useState(false)

  const guardar = async (nueva: string, confirmacion: string) => {
    const encontrados = validarContrasena(null, nueva, confirmacion)
    setErrores(encontrados)
    if (encontrados.nueva || encontrados.confirmacion) return
    setGuardando(true)
    setError(null)
    try {
      await servicio.restablecerContrasena(nueva)
      setListo(true)
    } catch (e) {
      const estado = typeof e === 'object' && e !== null && 'statusHTTP' in e ? (e as { statusHTTP?: number }).statusHTTP : undefined
      setError({ mensaje: mensajeDe(e, 'No pudimos guardar tu contraseña. Inténtalo de nuevo.'), vencido: estado === 403 })
    } finally {
      setGuardando(false)
    }
  }

  return { guardando, errores, error, listo, guardar }
}

type EstadoConfirmacion =
  | { readonly fase: 'confirmando' }
  | { readonly fase: 'listo'; readonly confirmacion: ConfirmacionCuentaTs }
  | { readonly fase: 'error'; readonly mensaje: string }

/**
 * Abre el enlace del correo: envía el token_hash al backend una sola vez (aunque React monte
 * dos veces en desarrollo) y, si trae sesión, la deja activa en SesionModel.
 */
export function useConfirmarCuenta(servicio: IAutenticacionService, sesion: SesionModel, tokenHash: string | null, tipo: string | null) {
  const iniciado = useRef(false)
  const faltanDatos = !tokenHash || !tipo
  const [estado, setEstado] = useState<EstadoConfirmacion>({ fase: 'confirmando' })

  useEffect(() => {
    if (iniciado.current || !tokenHash || !tipo) return
    iniciado.current = true
    servicio.confirmarCuenta(tokenHash, tipo)
      .then((confirmacion) => {
        if (confirmacion.acceso) sesion.establecerUsuarioAutenticado(confirmacion.acceso)
        setEstado({ fase: 'listo', confirmacion })
      })
      .catch((e: unknown) => setEstado({ fase: 'error', mensaje: mensajeDe(e, 'El enlace venció o ya se usó. Pide uno nuevo.') }))
  }, [servicio, sesion, tokenHash, tipo])

  return faltanDatos ? { fase: 'error' as const, mensaje: 'El enlace está incompleto. Ábrelo de nuevo desde tu correo.' } : estado
}
