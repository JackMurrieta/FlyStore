/**
 * DireccionesModel · Direcciones de entrega guardadas del cliente (pestaña «Direcciones»).
 * Ver, elegir o quitar la predeterminada y eliminar (el backend la oculta; los pedidos no cambian).
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { IPerfilGateway } from '../dominio/puertos/IPerfilGateway'
import type { DireccionEntregaTs } from '../dominio/DireccionEntregaTs'
import type { DireccionEntregaDTO } from './dto/DireccionEntregaDTO'
import { PerfilMapper } from './mappers/PerfilMapper'

export type AccionDireccion = 'predeterminada' | 'quitar' | 'eliminar'

export interface EstadoDirecciones {
  readonly cargando: boolean
  /** null mientras no se carga; [] si no tiene direcciones. */
  readonly direcciones: readonly DireccionEntregaTs[] | null
  readonly error: ErrorTs | null
  /** Dirección y acción en curso (para el indicador del botón). */
  readonly enCurso: { readonly id: number | null; readonly accion: AccionDireccion } | null
  readonly errorAccion: string | null
  /** Confirmación breve de la última acción («Elegiste … como predeterminada»). */
  readonly mensaje: string | null
}

const ESTADO_INICIAL: EstadoDirecciones = {
  cargando: false,
  direcciones: null,
  error: null,
  enCurso: null,
  errorAccion: null,
  mensaje: null,
}

export class DireccionesModel extends ModeloObservable<EstadoDirecciones> {
  private readonly gateway: IPerfilGateway

  constructor(gateway: IPerfilGateway) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
  }

  public listarDirecciones = async (): Promise<readonly DireccionEntregaTs[] | null> => {
    this.actualizar({ cargando: true, error: null })
    try {
      const direcciones = (await this.gateway.listarDirecciones()).map(PerfilMapper.convertirDireccionDTOaDireccionTs)
      this.actualizar({ cargando: false, direcciones })
      return direcciones
    } catch (error) {
      this.actualizar({ cargando: false, error: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos cargar tus direcciones. Inténtalo de nuevo.') })
      return null
    }
  }

  public marcarPredeterminada = (id: number) =>
    this.ejecutar(id, 'predeterminada', () => this.gateway.marcarPredeterminada(id), 'Listo: es tu dirección predeterminada.')

  public quitarPredeterminada = () =>
    this.ejecutar(null, 'quitar', () => this.gateway.quitarPredeterminada(),
      'Quitaste la predeterminada: al pedir te propondremos la última que usaste.')

  public eliminarDireccion = (id: number) =>
    this.ejecutar(id, 'eliminar', () => this.gateway.eliminarDireccion(id), 'Eliminaste la dirección. Tus pedidos anteriores no cambian.')

  public limpiarMensaje = (): void => {
    if (this.obtenerEstado().mensaje || this.obtenerEstado().errorAccion) this.actualizar({ mensaje: null, errorAccion: null })
  }

  public reiniciar = (): void => {
    this.establecer(ESTADO_INICIAL)
  }

  private async ejecutar(id: number | null, accion: AccionDireccion, llamada: () => Promise<DireccionEntregaDTO[]>, mensaje: string): Promise<boolean> {
    if (this.obtenerEstado().enCurso) return false
    this.actualizar({ enCurso: { id, accion }, errorAccion: null, mensaje: null })
    try {
      const direcciones = (await llamada()).map(PerfilMapper.convertirDireccionDTOaDireccionTs)
      this.actualizar({ enCurso: null, direcciones, mensaje })
      return true
    } catch (error) {
      this.actualizar({
        enCurso: null,
        errorAccion: PerfilMapper.convertirErrorAErrorTs(error, 'No pudimos guardar el cambio. Inténtalo de nuevo.').mensaje,
      })
      return false
    }
  }
}
