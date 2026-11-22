/**
 * Exportaciones públicas del módulo consultar-catalogo (CU-01).
 * Para el contenedor importa las rutas profundas (aplicacion/ModelosCatalogo, infraestructura/…)
 * y así no se arrastran las vistas al paquete principal; las vistas se cargan con lazy().
 */

// Raíz del módulo (para lazy loading en rutas)
export { CatalogoTienda } from './presentacion/CatalogoTienda'
export type { CatalogoTiendaProps, VistaTienda } from './presentacion/CatalogoTienda'
export { rutasTienda } from './presentacion/rutasTienda'

// Modelos y su creador
export { crearModelosCatalogo, invalidarModelosCatalogo } from './aplicacion/ModelosCatalogo'
export type { ModelosCatalogo } from './aplicacion/ModelosCatalogo'
export { CatalogoEnCursoModel } from './aplicacion/CatalogoEnCursoModel'
export { DetalleProductoModel } from './aplicacion/DetalleProductoModel'

// Puertos e implementaciones
export type { ICatalogoGateway } from './dominio/puertos/ICatalogoGateway'
export type { ICarritoCatalogo } from './dominio/puertos/ICarritoCatalogo'
export type { IAgregadoPendiente, AgregadoPendienteTs } from './dominio/puertos/IAgregadoPendiente'
export { CatalogoHttpGateway } from './infraestructura/CatalogoHttpGateway'
export { AgregadoPendienteStorage } from './infraestructura/AgregadoPendienteStorage'
