/**
 * Modelo de Sesión - Implementación real de ISesion
 * Patrón Observable (useSyncExternalStore en React)
 *
 * Responsabilidades:
 * - Mantener el estado de la sesión (cargando, anónimo, autenticado)
 * - Verificar sesión al inicio (GET /api/auth/yo)
 * - Actualizar estado tras login/registro/logout
 * - Gestionar OAuth con Google (redirect)
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ISesion, EstadoSesionTs, UsuarioSesionTs, RolTs } from '@compartido/sesion/ISesion'
import type { IAutenticacionService } from '../dominio/puertos/IAutenticacionService'
import type { IUsuarioService } from '../dominio/puertos/IUsuarioService'
import type { AccesoTs } from '../dominio/AccesoTs'
import { redirigirA } from '@infraestructura/navegador/redireccion'
import * as endpoints from '@infraestructura/http/endpoints'

export class SesionModel extends ModeloObservable<EstadoSesionTs> implements ISesion {
  private readonly autenticacionService: IAutenticacionService
  private readonly usuarioService: IUsuarioService

  constructor(
    autenticacionService: IAutenticacionService,
    usuarioService: IUsuarioService
  ) {
    super({
      estado: 'cargando' as const,
      usuario: null,
    })

    this.autenticacionService = autenticacionService
    this.usuarioService = usuarioService

    // Verificar sesión al iniciar
    this.verificarSesionInicial()
  }

  /**
   * Verifica si hay sesión activa al cargar la aplicación
   * Llama a GET /api/auth/yo con la cookie HttpOnly
   */
  private async verificarSesionInicial(): Promise<void> {
    try {
      const acceso = await this.usuarioService.obtenerUsuarioActual()
      this.establecerUsuarioAutenticado(acceso)
    } catch {
      // No hay sesión o expiró
      this.establecer({
        estado: 'anonimo' as const,
        usuario: null,
      })
    }
  }

  /**
   * Inicia sesión con Google (OAuth)
   * Redirige al backend que maneja todo el flujo
   */
  public iniciarConGoogle(redirigir?: string): void {
    const url = endpoints.auth.google()
    const urlCompleta = redirigir ? `${url}?redirect=${encodeURIComponent(redirigir)}` : url
    redirigirA(urlCompleta)
  }

  /**
   * Cierra la sesión del usuario
   * Llama a POST /api/auth/logout que elimina la cookie
   */
  public async cerrarSesion(): Promise<void> {
    try {
      await this.autenticacionService.logout()
    } finally {
      // Siempre marcar como anónimo, incluso si falla
      this.establecer({
        estado: 'anonimo' as const,
        usuario: null,
      })
    }
  }

  /**
   * Establece el estado como autenticado
   * Llamado tras login/registro exitoso
   */
  public establecerUsuarioAutenticado(acceso: AccesoTs): void {
    // Generar iniciales (primeras letras del nombre)
    const iniciales = acceso.nombre.charAt(0) + (acceso.apellidos.charAt(0) || '')

    const usuario: UsuarioSesionTs = {
      id: parseInt(acceso.userId, 10),
      nombre: `${acceso.nombre} ${acceso.apellidos}`,
      correo: acceso.email,
      telefono: null, // El backend no devuelve teléfono en AccesoDTO
      rol: acceso.tipoUsuario as RolTs,
      perfilCompleto: true, // Asumimos que si se autenticó, el perfil está completo
      iniciales,
    }

    this.establecer({
      estado: 'autenticado' as const,
      usuario,
    })
  }

  /**
   * Marca la sesión como anónima
   */
  public establecerAnonimo(): void {
    this.establecer({
      estado: 'anonimo' as const,
      usuario: null,
    })
  }
}
