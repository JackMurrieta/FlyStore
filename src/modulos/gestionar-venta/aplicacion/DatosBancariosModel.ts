/**
 * DatosBancariosModel · Datos para transferir y folio del pedido (B3).
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import type { DatosBancariosTs } from '../dominio/DatosBancariosTs'
import { PedidoVentaMapper } from './mappers/PedidoVentaMapper'

export interface EstadoDatosBancarios {
  readonly cargando: boolean
  readonly datosBancarios: DatosBancariosTs | null
  readonly error: ErrorTs | null
}

const ESTADO_INICIAL: EstadoDatosBancarios = { cargando: false, datosBancarios: null, error: null }

export class DatosBancariosModel extends ModeloObservable<EstadoDatosBancarios> {
  private readonly gateway: IGestionarVentaGateway

  constructor(gateway: IGestionarVentaGateway) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
  }

  /** Básico, mensaje 28. */
  public obtenerDatosBancarios = async (): Promise<DatosBancariosTs | null> => {
    this.actualizar({ cargando: true, error: null })
    try {
      const dto = await this.gateway.obtenerDatosBancarios()
      const datosBancarios = PedidoVentaMapper.convertirDatosBancariosDTOaDatosBancariosTs(dto)
      this.actualizar({ cargando: false, datosBancarios })
      return datosBancarios
    } catch (error) {
      this.actualizar({
        cargando: false,
        error: PedidoVentaMapper.convertirErrorAErrorTs(
          error,
          'No pudimos cargar los datos para pagar. Inténtalo de nuevo.'
        ),
      })
      return null
    }
  }

  public reiniciar = (): void => {
    this.establecer(ESTADO_INICIAL)
  }
}
