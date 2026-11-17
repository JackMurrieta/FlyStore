/**
 * El backend rechazó el comprobante (Alt5): formato, tamaño o contenido no válido.
 * Trae el mensaje que se muestra al cliente.
 */
export class RespuestaValidacionComprobanteException extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'RespuestaValidacionComprobanteException'
    Object.setPrototypeOf(this, RespuestaValidacionComprobanteException.prototype)
  }
}
