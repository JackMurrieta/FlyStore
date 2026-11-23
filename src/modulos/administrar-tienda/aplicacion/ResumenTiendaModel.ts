import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ConteoTs, EstadoResumenTiendaTs } from '../dominio/ResumenTiendaTs'
import type { IResumenTiendaGateway } from '../dominio/puertos/IResumenTiendaGateway'

/** Tope de productos que se cuentan por estado (el backend no devuelve totales). */
export const TOPE_CONTEO = 50

const ESTADO_INICIAL: EstadoResumenTiendaTs = { resumen: null, cargando: false, actualizado: null }

/**
 * Pendientes del Inicio del panel. Cada conteo se consulta por separado: si uno falla, los demás
 * se muestran igual (la tarjeta que falló dice «No disponible»).
 */
export class ResumenTiendaModel extends ModeloObservable<EstadoResumenTiendaTs> {
  private readonly gateway: IResumenTiendaGateway
  private solicitud = 0

  constructor(gateway: IResumenTiendaGateway) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
  }

  public cargar = async (): Promise<void> => {
    const numero = ++this.solicitud
    this.actualizar({ cargando: true })
    const [pagos, borrador, stockBajo] = await Promise.allSettled([
      this.gateway.obtenerPagosPorConfirmar().then((pedidos): ConteoTs => ({ cantidad: pedidos.length, hayMas: false })),
      this.contarProductos('BORRADOR'),
      this.contarProductos('STOCK_BAJO'),
    ])
    if (numero !== this.solicitud) return
    this.establecer({
      cargando: false,
      actualizado: new Date(),
      resumen: {
        pagosPorConfirmar: pagos.status === 'fulfilled' ? pagos.value : null,
        productosBorrador: borrador.status === 'fulfilled' ? borrador.value : null,
        productosStockBajo: stockBajo.status === 'fulfilled' ? stockBajo.value : null,
      },
    })
  }

  /** Al cerrar sesión no deben quedar cifras del panel en memoria. */
  public reiniciar = (): void => {
    this.solicitud++
    this.establecer(ESTADO_INICIAL)
  }

  private async contarProductos(estado: 'BORRADOR' | 'STOCK_BAJO'): Promise<ConteoTs> {
    const pagina = await this.gateway.obtenerProductosPorEstado(estado, TOPE_CONTEO)
    return { cantidad: pagina.productos.length, hayMas: pagina.hayMas }
  }
}
