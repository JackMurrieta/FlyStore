/**
 * Exportaciones públicas del módulo gestionar-venta (CU-02).
 * Para el contenedor importa las rutas profundas (aplicacion/ModelosVenta, infraestructura/…)
 * y así no se arrastran las vistas al paquete principal; las vistas se cargan con lazy().
 */

// Raíz del módulo (para lazy loading en rutas)
export { GestionarVenta } from './presentacion/GestionarVenta'
export type { GestionarVentaProps } from './presentacion/GestionarVenta'

// Modelos y su creador (para contenedor y demo)
export { crearModelosVenta, reiniciarModelosVenta } from './aplicacion/ModelosVenta'
export type { ModelosVenta } from './aplicacion/ModelosVenta'
export { PedidoEnCursoModel } from './aplicacion/PedidoEnCursoModel'
export { DatosEntregaModel } from './aplicacion/DatosEntregaModel'
export { DatosBancariosModel } from './aplicacion/DatosBancariosModel'

// Puerto e implementación HTTP
export type { IGestionarVentaGateway } from './dominio/puertos/IGestionarVentaGateway'
export { GestionarVentaHttpGateway } from './infraestructura/GestionarVentaHttpGateway'
