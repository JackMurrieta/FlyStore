/**
 * Exportaciones públicas del módulo editar-perfil (Gestionar perfil · «Mi perfil»).
 * El contenedor importa rutas profundas (aplicacion/…, infraestructura/…) para no arrastrar las vistas.
 */

export { EditarPerfil } from './presentacion/EditarPerfil'
export type { EditarPerfilProps } from './presentacion/EditarPerfil'
export { crearModelosPerfil, reiniciarModelosPerfil } from './aplicacion/ModelosPerfil'
export type { ModelosPerfil } from './aplicacion/ModelosPerfil'
export type { IPerfilGateway } from './dominio/puertos/IPerfilGateway'
export { PerfilHttpGateway } from './infraestructura/PerfilHttpGateway'
