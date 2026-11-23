import { StrictMode, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { IAutenticacionService } from '../../dominio/puertos/IAutenticacionService'
import type { SesionModel } from '../../aplicacion/SesionModel'
import { useConfirmarCuenta, useRecuperarContrasena, useRestablecerContrasena } from './useCuentaPorCorreo'

function servicio(extra: Partial<IAutenticacionService> = {}): IAutenticacionService {
  return {
    login: vi.fn(), registro: vi.fn(), logout: vi.fn(),
    recuperarContrasena: vi.fn().mockResolvedValue('Si hay una cuenta con ese correo, te enviamos un enlace.'),
    confirmarCuenta: vi.fn().mockResolvedValue({ tipo: 'email', mensaje: 'Tu correo quedó confirmado.', acceso: { userId: 'u', email: 'ana@correo.mx', nombre: 'Ana', apellidos: 'Torres', tipoUsuario: 'CLIENTE' } }),
    restablecerContrasena: vi.fn().mockResolvedValue(undefined),
    ...extra,
  }
}
const sesion = { establecerUsuarioAutenticado: vi.fn() } as unknown as SesionModel
const estricto = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>

describe('Cuenta por correo', () => {
  it('confirma el enlace una sola vez (aunque React monte dos veces) y abre la sesión', async () => {
    const s = servicio()
    const { result } = renderHook(() => useConfirmarCuenta(s, sesion, 'hash', 'email'), { wrapper: estricto })
    await waitFor(() => expect(result.current.fase).toBe('listo'))
    expect(s.confirmarCuenta).toHaveBeenCalledTimes(1)
    expect(sesion.establecerUsuarioAutenticado).toHaveBeenCalled()
  })

  it('enlace incompleto o vencido', async () => {
    expect(renderHook(() => useConfirmarCuenta(servicio(), sesion, null, 'email')).result.current.fase).toBe('error')
    const s = servicio({ confirmarCuenta: vi.fn().mockRejectedValue(new Error('El enlace venció o ya se usó. Pide uno nuevo.')) })
    const { result } = renderHook(() => useConfirmarCuenta(s, sesion, 'hash', 'recovery'))
    await waitFor(() => expect(result.current).toEqual({ fase: 'error', mensaje: 'El enlace venció o ya se usó. Pide uno nuevo.' }))
  })

  it('«Olvidé mi contraseña» valida el correo y muestra el mensaje', async () => {
    const s = servicio()
    const { result } = renderHook(() => useRecuperarContrasena(s))
    await act(() => result.current.enviar('no-es-correo'))
    expect(result.current.error).toBe('Escribe un correo válido')
    expect(s.recuperarContrasena).not.toHaveBeenCalled()
    await act(() => result.current.enviar('ana@correo.mx'))
    expect(result.current.mensaje).toContain('te enviamos un enlace')
  })

  it('restablecer: valida, guarda y reconoce el enlace vencido (403)', async () => {
    const s = servicio({ restablecerContrasena: vi.fn().mockRejectedValueOnce(Object.assign(new Error('El enlace venció'), { statusHTTP: 403 })).mockResolvedValue(undefined) })
    const { result } = renderHook(() => useRestablecerContrasena(s))
    await act(() => result.current.guardar('Nueva1234', 'Otra1234'))
    expect(result.current.errores.confirmacion).toBe('Las contraseñas no coinciden')
    await act(() => result.current.guardar('Nueva1234', 'Nueva1234'))
    expect(result.current.error).toEqual({ mensaje: 'El enlace venció', vencido: true })
    await act(() => result.current.guardar('Nueva1234', 'Nueva1234'))
    expect(result.current.listo).toBe(true)
  })
})
