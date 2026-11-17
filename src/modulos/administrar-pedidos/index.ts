/**
 * Exportaciones públicas del módulo administrar-pedidos (CU04)
 * Solo exporta lo que otros módulos deben consumir
 */

// Vistas (para lazy loading en rutas)
export { default as PedidosAdminVista } from './presentacion/vistas/PedidosAdminVista'
export { default as DetallePedidoVista } from './presentacion/vistas/DetallePedidoVista'

// Servicio (para contenedor)
export { PedidosAdminHttpService } from './infraestructura/PedidosAdminHttpService'

// Modelo (para contenedor)
export { PedidosAdminModel } from './aplicacion/PedidosAdminModel'

// Puerto (para pruebas y otras implementaciones)
export type { IPedidosAdminService } from './dominio/puertos/IPedidosAdminService'
