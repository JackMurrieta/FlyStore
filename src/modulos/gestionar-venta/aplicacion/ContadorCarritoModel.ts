/**
 * ContadorCarritoModel · cuántos productos distintos (líneas) tiene el carrito del cliente.
 *
 * Lo pinta el encabezado en el ícono del carrito. Sigue al PedidoEnCursoModel (única fuente de
 * verdad del carrito): cada vez que el backend responde con el carrito (agregar desde la ficha,
 * cambiar cantidad, quitar línea) el contador se actualiza solo. Al registrar el pedido queda en 0.
 *
 * Si nadie ha abierto el carrito todavía, consulta el pedido en curso por su cuenta, sin tocar el
 * estado del PedidoEnCursoModel (no reinicia el método de pago ni muestra errores en el checkout).
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { IContadorCarrito } from '@compartido/carrito'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import type { CarritoTs } from '../dominio/CarritoTs'
import type { PedidoEnCursoModel } from './PedidoEnCursoModel'
import { PedidoVentaMapper } from './mappers/PedidoVentaMapper'

export interface EstadoContadorCarrito {
  /** Productos distintos del carrito; null mientras no se conoce. */
  readonly productos: number | null
}

export class ContadorCarritoModel extends ModeloObservable<EstadoContadorCarrito> implements IContadorCarrito {
  private readonly gateway: IGestionarVentaGateway
  private readonly pedidoEnCurso: PedidoEnCursoModel
  private carritoAnterior: CarritoTs | null
  private consultando = false
  /** Descarta respuestas que llegan después de cerrar sesión. */
  private generacion = 0

  constructor(gateway: IGestionarVentaGateway, pedidoEnCurso: PedidoEnCursoModel) {
    super({ productos: null })
    this.gateway = gateway
    this.pedidoEnCurso = pedidoEnCurso
    this.carritoAnterior = pedidoEnCurso.obtenerEstado().carrito
    pedidoEnCurso.suscribir(this.seguirCarrito)
  }

  public readonly obtenerProductos = (): number | null => this.obtenerEstado().productos

  public readonly cargar = (clienteId: string): void => {
    if (this.obtenerProductos() !== null || this.consultando) return
    const { carrito } = this.pedidoEnCurso.obtenerEstado()
    if (carrito) {
      this.fijar(carrito.totalProductos)
      return
    }
    this.consultando = true
    const generacion = this.generacion
    this.gateway.obtenerPedidoVentaEnCurso(clienteId)
      .then((dto) => {
        // Si mientras tanto el carrito cambió (p. ej. se agregó un producto), manda el más reciente.
        if (generacion !== this.generacion || this.obtenerProductos() !== null) return
        this.fijar(PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs(dto).totalProductos)
      })
      .catch(() => {
        // Sin contador: el carrito mostrará el error cuando el cliente lo abra.
      })
      .finally(() => {
        if (generacion === this.generacion) this.consultando = false
      })
  }

  /** Al cerrar o expirar la sesión. */
  public readonly reiniciar = (): void => {
    this.generacion++
    this.consultando = false
    this.carritoAnterior = null
    this.establecer({ productos: null })
  }

  private readonly seguirCarrito = (): void => {
    const { carrito, pedidoRegistrado } = this.pedidoEnCurso.obtenerEstado()
    const anterior = this.carritoAnterior
    this.carritoAnterior = carrito
    if (carrito === anterior) return
    if (carrito) this.fijar(carrito.totalProductos)
    // Se registró el pedido: el carrito se convirtió en pedido y queda vacío.
    else if (anterior && pedidoRegistrado) this.fijar(0)
  }

  private fijar(productos: number): void {
    if (productos !== this.obtenerProductos()) this.actualizar({ productos })
  }
}
