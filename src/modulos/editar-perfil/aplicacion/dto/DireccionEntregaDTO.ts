export interface DireccionEntregaDTO {
  readonly id: number
  readonly nombreCompleto: string | null
  readonly telefono: string | null
  readonly ciudad: string | null
  readonly estado: string | null
  readonly direccion: string | null
  readonly referencias: string | null
  readonly predeterminada: boolean
}
