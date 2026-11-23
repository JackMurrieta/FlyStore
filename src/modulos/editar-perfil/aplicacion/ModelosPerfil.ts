import type { IPerfilGateway } from '../dominio/puertos/IPerfilGateway'
import type { ISesionCuenta } from '../dominio/puertos/ISesionCuenta'
import { DireccionesModel } from './DireccionesModel'
import { PerfilModel } from './PerfilModel'

/** Modelos del caso Gestionar perfil. Viven mientras la app está abierta. */
export interface ModelosPerfil {
  readonly perfil: PerfilModel
  readonly direcciones: DireccionesModel
}

/** Creador (GRASP): lo usa app/contenedor.ts con el gateway HTTP y las pruebas con uno falso. */
export function crearModelosPerfil(gateway: IPerfilGateway, sesion: ISesionCuenta): ModelosPerfil {
  return { perfil: new PerfilModel(gateway, sesion), direcciones: new DireccionesModel(gateway) }
}

/** Limpia los modelos al cerrar o expirar la sesión. */
export function reiniciarModelosPerfil(modelos: ModelosPerfil): void {
  modelos.perfil.reiniciar()
  modelos.direcciones.reiniciar()
}
