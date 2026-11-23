/** Dirección de entrega guardada, lista para la tarjeta de «Direcciones». */
export interface DireccionEntregaTs {
  readonly id: number
  readonly nombreCompleto: string
  /** «644 123 4567». */
  readonly telefono: string
  /** «Calle 5 de Febrero 1234, Col. Centro». */
  readonly direccion: string
  /** «Ciudad Obregón, Sonora». */
  readonly ciudadEstado: string
  readonly referencias: string | null
  readonly predeterminada: boolean
}
