import type { AccesoTs } from './AccesoTs'

/** Tipos de enlace que envía Supabase por correo (plantillas con token_hash). */
export type TipoEnlaceCorreo = 'email' | 'signup' | 'recovery' | 'email_change' | 'invite' | 'magiclink'

/** Resultado de abrir un enlace de correo. */
export interface ConfirmacionCuentaTs {
  readonly tipo: string
  readonly mensaje: string
  /** Usuario con sesión abierta; null si falta otra confirmación (cambio de correo seguro). */
  readonly acceso: AccesoTs | null
}
