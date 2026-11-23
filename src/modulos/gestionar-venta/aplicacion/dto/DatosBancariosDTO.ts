/**
 * Datos de la cuenta del administrador para transferir, más el folio del pedido
 * (el concepto de la transferencia). «Backend genera folio» (diagrama, mensaje 30).
 */
export interface DatosBancariosDTO {
  readonly banco: string
  readonly titular: string
  readonly numeroCuenta: string
  readonly clabe: string
  readonly folio: string
}
