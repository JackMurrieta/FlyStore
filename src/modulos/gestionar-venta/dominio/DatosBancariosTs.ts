/** Datos para transferir (B3). El concepto es el folio que genera el backend. */
export interface DatosBancariosTs {
  readonly banco: string
  readonly titular: string
  readonly numeroCuenta: string
  readonly clabe: string
  readonly folio: string
  readonly concepto: string
}
