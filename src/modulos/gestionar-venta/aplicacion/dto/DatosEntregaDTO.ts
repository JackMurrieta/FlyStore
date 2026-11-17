/** Datos de entrega del cliente. En la respuesta pueden venir vacíos (cliente nuevo). */
export interface DatosEntregaDTO {
  readonly nombreCompleto: string | null
  readonly telefono: string | null
  readonly ciudad: string | null
  readonly estado: string | null
  readonly direccion: string | null
  readonly referencias: string | null
  readonly guardarComoPredeterminada: boolean
}
