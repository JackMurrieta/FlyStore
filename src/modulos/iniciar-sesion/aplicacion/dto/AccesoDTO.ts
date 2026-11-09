/**
 * DTO de respuesta de login/registro
 * El backend devuelve esto tras autenticación exitosa
 * El token JWT viene en cookie HttpOnly (NO en este JSON)
 */

export interface AccesoDTO {
  readonly user_id: string
  readonly email: string
  readonly nombre: string
  readonly apellidos: string
  readonly tipo_usuario: 'cliente' | 'admin' | 'empleado'
}
