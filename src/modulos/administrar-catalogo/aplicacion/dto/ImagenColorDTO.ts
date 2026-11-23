/**
 * Imagen ligada a un color (contrato `ImagenColorDTO` del backend). Un solo origen por imagen:
 * `idImagen` conserva una guardada (edición), `archivo` es el índice de la parte `imagenes` del multipart
 * y `url` una dirección ya pública. El color debe ser uno de los de las variantes que se envían.
 */
export interface ImagenColorDTO {
  idImagen?: string
  url?: string
  archivo?: number
  color: string
}
