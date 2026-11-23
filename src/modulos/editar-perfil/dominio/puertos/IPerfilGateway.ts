import type { PerfilDTO } from '../../aplicacion/dto/PerfilDTO'
import type { ActualizarPerfilPeticionDTO } from '../../aplicacion/dto/ActualizarPerfilPeticionDTO'
import type { DireccionEntregaDTO } from '../../aplicacion/dto/DireccionEntregaDTO'
import type { MensajeDTO } from '../../aplicacion/dto/MensajeDTO'

/**
 * Puerto único del caso Gestionar perfil hacia el backend (PerfilController y AuthController).
 * 2xx → DTO; 4xx/5xx → lanza el error con el mensaje del backend. No valida ni transforma.
 */
export interface IPerfilGateway {
  obtenerPerfil(): Promise<PerfilDTO>
  actualizarPerfil(dto: ActualizarPerfilPeticionDTO): Promise<PerfilDTO>
  listarDirecciones(): Promise<DireccionEntregaDTO[]>
  marcarPredeterminada(id: number): Promise<DireccionEntregaDTO[]>
  quitarPredeterminada(): Promise<DireccionEntregaDTO[]>
  eliminarDireccion(id: number): Promise<DireccionEntregaDTO[]>
  /** El correo cambia hasta que se confirma el enlace enviado al correo nuevo. */
  solicitarCambioCorreo(correo: string): Promise<MensajeDTO>
  cambiarContrasena(actual: string, nueva: string): Promise<void>
  cerrarSesionGlobal(): Promise<void>
}
