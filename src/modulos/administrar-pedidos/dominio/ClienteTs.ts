/**
 * Cliente de un pedido (lo que el administrador necesita ver y para notificar)
 */

export interface ClienteTs {
  readonly id: number
  readonly nombre: string
  readonly telefono: string | null
}
