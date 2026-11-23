/**
 * Panel «Administrar tienda»: layout de /admin/*, Inicio con pendientes y secciones «Pronto».
 * Las pantallas de cada caso de uso (catálogo, pedidos…) viven en su módulo y se pintan dentro.
 */
export { PanelTienda } from './presentacion/PanelTienda'
export type { PanelTiendaProps } from './presentacion/PanelTienda'
export { InicioPanelView } from './presentacion/vistas/InicioPanelView'
export { ProximamenteView } from './presentacion/vistas/ProximamenteView'
export { RUTA_PANEL, SECCIONES_PANEL, seccionesPara, migasDe } from './presentacion/secciones'
export type { ClaveSeccion, SeccionPanel } from './presentacion/secciones'
export type { ModelosPanel } from './presentacion/PanelTiendaContext'
export { ResumenTiendaModel } from './aplicacion/ResumenTiendaModel'
export { ResumenTiendaHttpGateway } from './infraestructura/ResumenTiendaHttpGateway'
export type { IResumenTiendaGateway } from './dominio/puertos/IResumenTiendaGateway'
