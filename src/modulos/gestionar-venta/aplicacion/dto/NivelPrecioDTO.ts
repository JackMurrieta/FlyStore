import type { TipoPrecio } from '../../dominio/TipoPrecio'

export interface NivelPrecioDTO {
  readonly tipoPrecio: TipoPrecio
  readonly minPiezas: number
}
