/**
 * PerfilModel · Experto en información del perfil del usuario con sesión (GRASP).
 * Datos personales y seguridad de la cuenta (correo, contraseña y sesiones).
 * Patrón Observador: los hooks se suscriben con useSyncExternalStore.
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { IPerfilGateway } from '../dominio/puertos/IPerfilGateway'
import type { ISesionCuenta } from '../dominio/puertos/ISesionCuenta'
import type { DatosPersonalesTs, ErroresDatosPersonales, PerfilTs } from '../dominio/PerfilTs'
import { type ErroresContrasena, sinErrores, validarContrasena, validarCorreo, validarDatosPersonales } from '../dominio/ReglasPerfil'
import { PerfilMapper } from './mappers/PerfilMapper'

export interface EstadoPerfil {
  readonly cargando: boolean
  readonly perfil: PerfilTs | null
  readonly error: ErrorTs | null

  readonly guardando: boolean
  readonly erroresDatos: ErroresDatosPersonales
  readonly errorGuardar: ErrorTs | null
  readonly datosGuardados: boolean

  readonly enviandoCorreo: boolean
  readonly errorCorreo: string | null
  readonly mensajeCorreo: string | null

  readonly cambiandoContrasena: boolean
  readonly erroresContrasena: ErroresContrasena
  readonly errorContrasena: string | null
  readonly contrasenaCambiada: boolean

  readonly cerrandoSesiones: boolean
  readonly errorSesiones: string | null
}

const ESTADO_INICIAL: EstadoPerfil = {
  cargando: false,
  perfil: null,
  error: null,
  guardando: false,
  erroresDatos: {},
  errorGuardar: null,
  datosGuardados: false,
  enviandoCorreo: false,
  errorCorreo: null,
  mensajeCorreo: null,
  cambiandoContrasena: false,
  erroresContrasena: {},
  errorContrasena: null,
  contrasenaCambiada: false,
  cerrandoSesiones: false,
  errorSesiones: null,
}

export class PerfilModel extends ModeloObservable<EstadoPerfil> {
  private readonly gateway: IPerfilGateway
  private readonly sesion: ISesionCuenta

  constructor(gateway: IPerfilGateway, sesion: ISesionCuenta) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
    this.sesion = sesion
  }

  public obtenerPerfil = async (): Promise<PerfilTs | null> => {
    this.actualizar({ cargando: true, error: null })
    try {
      const perfil = PerfilMapper.convertirPerfilDTOaPerfilTs(await this.gateway.obtenerPerfil())
      this.actualizar({ cargando: false, perfil })
      return perfil
    } catch (error) {
      this.actualizar({ cargando: false, error: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos cargar tu perfil. Inténtalo de nuevo.') })
      return null
    }
  }

  // ───────────── Datos personales ─────────────

  /** Valida en el front, guarda y refresca el nombre que muestra el encabezado. */
  public guardarDatosPersonales = async (datos: DatosPersonalesTs): Promise<boolean> => {
    const erroresDatos = validarDatosPersonales(datos)
    if (!sinErrores(erroresDatos)) {
      this.actualizar({ erroresDatos, datosGuardados: false })
      return false
    }
    this.actualizar({ guardando: true, erroresDatos: {}, errorGuardar: null, datosGuardados: false })
    try {
      const perfil = PerfilMapper.convertirPerfilDTOaPerfilTs(
        await this.gateway.actualizarPerfil(PerfilMapper.convertirDatosPersonalesaDTO(datos))
      )
      this.actualizar({ guardando: false, perfil, datosGuardados: true })
      void this.sesion.refrescarUsuario().catch(() => undefined)
      return true
    } catch (error) {
      this.actualizar({
        guardando: false,
        errorGuardar: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos guardar tus datos. Inténtalo de nuevo.'),
      })
      return false
    }
  }

  /** El usuario vuelve a escribir: se quitan los avisos anteriores. */
  public editarDatos = (): void => {
    const { datosGuardados, errorGuardar, erroresDatos } = this.obtenerEstado()
    if (datosGuardados || errorGuardar || !sinErrores(erroresDatos)) this.actualizar({ datosGuardados: false, errorGuardar: null, erroresDatos: {} })
  }

  // ───────────── Seguridad ─────────────

  public solicitarCambioCorreo = async (correo: string): Promise<boolean> => {
    const perfil = this.obtenerEstado().perfil
    const errorCorreo = validarCorreo(correo, perfil?.correo ?? '')
    if (errorCorreo) {
      this.actualizar({ errorCorreo, mensajeCorreo: null })
      return false
    }
    const limpio = correo.trim().toLowerCase()
    this.actualizar({ enviandoCorreo: true, errorCorreo: null, mensajeCorreo: null })
    try {
      const { mensaje } = await this.gateway.solicitarCambioCorreo(limpio)
      this.actualizar({
        enviandoCorreo: false,
        mensajeCorreo: mensaje,
        perfil: perfil ? { ...perfil, correoPendiente: limpio } : perfil,
      })
      return true
    } catch (error) {
      this.actualizar({
        enviandoCorreo: false,
        errorCorreo: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos enviar el enlace. Inténtalo de nuevo.').mensaje,
      })
      return false
    }
  }

  public cambiarContrasena = async (actual: string, nueva: string, confirmacion: string): Promise<boolean> => {
    const erroresContrasena = validarContrasena(actual, nueva, confirmacion)
    if (!sinErrores(erroresContrasena)) {
      this.actualizar({ erroresContrasena, contrasenaCambiada: false, errorContrasena: null })
      return false
    }
    this.actualizar({ cambiandoContrasena: true, erroresContrasena: {}, errorContrasena: null, contrasenaCambiada: false })
    try {
      await this.gateway.cambiarContrasena(actual, nueva)
      this.actualizar({ cambiandoContrasena: false, contrasenaCambiada: true })
      return true
    } catch (error) {
      this.actualizar({
        cambiandoContrasena: false,
        errorContrasena: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos cambiar tu contraseña. Inténtalo de nuevo.').mensaje,
      })
      return false
    }
  }

  public limpiarAvisosSeguridad = (): void => {
    this.actualizar({ errorCorreo: null, errorContrasena: null, erroresContrasena: {}, contrasenaCambiada: false, errorSesiones: null })
  }

  /** Cierra la sesión en todos los dispositivos, incluido este. */
  public cerrarSesionGlobal = async (): Promise<boolean> => {
    this.actualizar({ cerrandoSesiones: true, errorSesiones: null })
    try {
      await this.gateway.cerrarSesionGlobal()
      this.reiniciar()
      this.sesion.establecerAnonimo()
      return true
    } catch (error) {
      this.actualizar({
        cerrandoSesiones: false,
        errorSesiones: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos cerrar tus sesiones. Inténtalo de nuevo.').mensaje,
      })
      return false
    }
  }

  /** Al cerrar sesión: no deja datos del usuario anterior en memoria. */
  public reiniciar = (): void => {
    this.establecer(ESTADO_INICIAL)
  }
}
