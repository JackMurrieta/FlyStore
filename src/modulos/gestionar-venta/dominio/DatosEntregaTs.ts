/** Datos de entrega del formulario B2 (precargados desde la cuenta del cliente). */
export interface DatosEntregaTs {
  readonly nombreCompleto: string
  readonly telefono: string
  readonly ciudad: string
  readonly estado: string
  readonly direccion: string
  readonly referencias: string
  readonly guardarComoPredeterminada: boolean
}

export type CampoDatosEntrega = Exclude<keyof DatosEntregaTs, 'guardarComoPredeterminada'>

export type ErroresDatosEntregaTs = Partial<Record<CampoDatosEntrega, string>>
