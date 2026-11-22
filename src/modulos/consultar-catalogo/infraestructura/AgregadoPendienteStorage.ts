/* eslint-disable no-restricted-globals -- se guardan ids y cantidad, nunca un token (ver la clase) */
import type { AgregadoPendienteTs, IAgregadoPendiente } from '../dominio/puertos/IAgregadoPendiente'

const CLAVE = 'fly.agregarAlCarritoPendiente'
/** Un día: alcanza para confirmar el correo de una cuenta nueva y volver. */
const VIGENCIA_MS = 24 * 60 * 60 * 1000

interface Guardado extends AgregadoPendienteTs {
  readonly guardado: number
}

/**
 * Guarda el «Agregar al carrito» pendiente en localStorage (sobrevive a la pestaña del correo de
 * confirmación). Solo ids y cantidad: ningún dato personal. Si el navegador no deja guardar, no pasa nada.
 */
export class AgregadoPendienteStorage implements IAgregadoPendiente {
  private readonly ahora: () => number

  constructor(ahora: () => number = () => Date.now()) {
    this.ahora = ahora
  }

  guardar(pendiente: AgregadoPendienteTs): void {
    try {
      const guardado: Guardado = { ...pendiente, guardado: this.ahora() }
      localStorage.setItem(CLAVE, JSON.stringify(guardado))
    } catch {
      /* almacenamiento no disponible: la persona vuelve a tocar «Agregar» */
    }
  }

  obtener(): AgregadoPendienteTs | null {
    try {
      const texto = localStorage.getItem(CLAVE)
      if (!texto) return null
      const valor = JSON.parse(texto) as Partial<Guardado>
      const valido = Number.isInteger(valor.idProducto) && Number.isInteger(valor.idVariante)
        && Number.isInteger(valor.cantidad) && (valor.cantidad ?? 0) > 0
        && typeof valor.guardado === 'number' && this.ahora() - valor.guardado < VIGENCIA_MS
      if (!valido) {
        this.limpiar()
        return null
      }
      return { idProducto: valor.idProducto!, idVariante: valor.idVariante!, cantidad: valor.cantidad! }
    } catch {
      return null
    }
  }

  limpiar(): void {
    try {
      localStorage.removeItem(CLAVE)
    } catch {
      /* nada que limpiar */
    }
  }
}
