/** «Regresa un String, boolean, msj» (diagrama, mensaje 42). */
export interface RespuestaValidacionComprobanteDTO {
  /** Ruta del archivo guardado en el almacenamiento del backend. */
  readonly comprobanteRuta: string
  readonly valido: boolean
  readonly mensaje: string
}
