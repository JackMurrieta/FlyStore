/** Código de descuento aplicado a una línea. Un código por producto. */
export interface CodigoDescuentoAplicadoDTO {
  readonly codigo: string
  /** «10%» o «$20»: el backend decide cómo describirlo. */
  readonly etiquetaValor: string
  /** descuentoUnitario × cantidad */
  readonly montoDescuento: number
}
