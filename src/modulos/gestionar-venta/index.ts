/**
 * Exportaciones públicas del módulo gestionar-venta (CU-02).
 * Para el contenedor importa las rutas profundas (aplicacion/ModelosVenta, infraestructura/…)
 * y así no se arrastran las vistas al paquete principal; las vistas se cargan con lazy().
 */

// Raíz del módulo (para lazy loading en rutas)
export { GestionarVenta } from './presentacion/GestionarVenta'
export type { GestionarVentaProps } from './presentacion/GestionarVenta'
// S6 «Mis pedidos» (subir el comprobante después)
export { MisPedidos } from './presentacion/MisPedidos'
export type { MisPedidosProps } from './presentacion/MisPedidos'

// Modelos y su creador (para contenedor y demo)
export { crearModelosVenta, reiniciarModelosVenta } from './aplicacion/ModelosVenta'
export type { ModelosVenta } from './aplicacion/ModelosVenta'
export { PedidoEnCursoModel } from './aplicacion/PedidoEnCursoModel'
export { DatosEntregaModel } from './aplicacion/DatosEntregaModel'
export { DatosBancariosModel } from './aplicacion/DatosBancariosModel'
export { PedidoModel } from './aplicacion/PedidoModel'

// Puerto e implementación HTTP
export type { IGestionarVentaGateway } from './dominio/puertos/IGestionarVentaGateway'
export { GestionarVentaHttpGateway } from './infraestructura/GestionarVentaHttpGateway'
