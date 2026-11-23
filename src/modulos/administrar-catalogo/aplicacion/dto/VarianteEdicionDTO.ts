/** Con `idVariante` solo cambia la existencia; sin él es una variante nueva (talla + color). */
export interface VarianteEdicionDTO {
  idVariante?: string
  talla?: string
  color?: string
  stock: number
}
