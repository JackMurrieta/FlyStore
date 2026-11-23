import type { AccesoDTO } from './AccesoDTO'

/** Respuesta de POST /api/auth/confirmar. */
export interface ConfirmacionCuentaDTO {
  readonly tipo: string
  readonly mensaje: string
  readonly usuario: AccesoDTO | null
}
