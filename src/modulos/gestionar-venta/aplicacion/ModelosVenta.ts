import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import { DatosBancariosModel } from './DatosBancariosModel'
import { DatosEntregaModel } from './DatosEntregaModel'
import { PedidoEnCursoModel } from './PedidoEnCursoModel'

/** Los tres modelos del CU-02. Viven mientras la app está abierta para conservar los pasos. */
export interface ModelosVenta {
  readonly pedidoEnCurso: PedidoEnCursoModel
  readonly datosEntrega: DatosEntregaModel
  readonly datosBancarios: DatosBancariosModel
}

/** Creador (GRASP): lo usa app/contenedor.ts con el gateway HTTP y el demo con uno en memoria. */
export function crearModelosVenta(gateway: IGestionarVentaGateway, reloj?: () => Date): ModelosVenta {
  const datosEntrega = new DatosEntregaModel(gateway)
  return {
    datosEntrega,
    datosBancarios: new DatosBancariosModel(gateway),
    pedidoEnCurso: new PedidoEnCursoModel(gateway, datosEntrega, reloj),
  }
}

/** Limpia los tres modelos (al cerrar o expirar la sesión). */
export function reiniciarModelosVenta(modelos: ModelosVenta): void {
  modelos.pedidoEnCurso.reiniciar()
  modelos.datosEntrega.reiniciar()
  modelos.datosBancarios.reiniciar()
}
