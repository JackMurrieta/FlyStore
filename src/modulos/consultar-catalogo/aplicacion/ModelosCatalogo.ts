import type { IAgregadoPendiente } from '../dominio/puertos/IAgregadoPendiente'
import type { ICarritoCatalogo } from '../dominio/puertos/ICarritoCatalogo'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'
import { CatalogoEnCursoModel } from './CatalogoEnCursoModel'
import { DetalleProductoModel } from './DetalleProductoModel'

/** Modelos del CU-01 Consultar catálogo. Viven mientras la app está abierta. */
export interface ModelosCatalogo {
  readonly catalogo: CatalogoEnCursoModel
  readonly detalle: DetalleProductoModel
}

/** Creador (GRASP): lo usa app/contenedor.ts con el gateway HTTP y las pruebas con dobles. */
export function crearModelosCatalogo(gateway: ICatalogoGateway, carrito: ICarritoCatalogo, pendientes: IAgregadoPendiente): ModelosCatalogo {
  return {
    catalogo: new CatalogoEnCursoModel(gateway),
    detalle: new DetalleProductoModel(gateway, carrito, pendientes),
  }
}

/**
 * Al iniciar o cerrar sesión cambia el precio de referencia (tipo de cliente): se vuelve a consultar.
 * La ficha abierta se refresca sin perder lo elegido (si la sesión venció al agregar, el aviso sigue).
 */
export function invalidarModelosCatalogo(modelos: ModelosCatalogo): void {
  modelos.catalogo.invalidar()
  void modelos.detalle.refrescar()
}
