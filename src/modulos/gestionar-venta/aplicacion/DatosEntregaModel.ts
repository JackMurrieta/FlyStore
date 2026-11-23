/**
 * DatosEntregaModel · Experto en los datos de entrega del pedido en curso (B2).
 * Obtiene los datos guardados del cliente, guarda lo que edita y valida antes de pagar (A5).
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import type { CampoDatosEntrega, DatosEntregaTs, ErroresDatosEntregaTs } from '../dominio/DatosEntregaTs'
import { DIGITOS_TELEFONO, soloDigitos } from '../dominio/ReglasVenta'
import { PedidoVentaMapper } from './mappers/PedidoVentaMapper'

export interface EstadoDatosEntrega {
  readonly cargando: boolean
  readonly datosEntrega: DatosEntregaTs | null
  readonly erroresCampo: ErroresDatosEntregaTs
  readonly error: ErrorTs | null
}

const ESTADO_INICIAL: EstadoDatosEntrega = {
  cargando: false,
  datosEntrega: null,
  erroresCampo: {},
  error: null,
}

const OBLIGATORIOS: readonly CampoDatosEntrega[] = ['nombreCompleto', 'telefono', 'ciudad', 'estado', 'direccion']

export class DatosEntregaModel extends ModeloObservable<EstadoDatosEntrega> {
  private readonly gateway: IGestionarVentaGateway

  constructor(gateway: IGestionarVentaGateway) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
  }

  /**
   * Básico, mensaje 13. Si falla, deja el formulario vacío para que el cliente lo capture
   * y avisa del error; no bloquea la compra.
   */
  public obtenerDatosEntrega = async (clienteId: string): Promise<DatosEntregaTs | null> => {
    this.actualizar({ cargando: true, error: null, erroresCampo: {} })
    try {
      const dto = await this.gateway.obtenerDatosEntrega(clienteId)
      const datosEntrega = PedidoVentaMapper.convertirDatosEntregaDTOaDatosEntregaTs(dto)
      this.actualizar({ cargando: false, datosEntrega })
      return datosEntrega
    } catch (error) {
      const actuales = this.obtenerEstado().datosEntrega
      this.actualizar({
        cargando: false,
        datosEntrega: actuales ?? PedidoVentaMapper.convertirDatosEntregaDTOaDatosEntregaTs(null),
        error: PedidoVentaMapper.convertirErrorAErrorTs(
          error,
          'No pudimos cargar tus datos guardados. Captúralos para continuar.'
        ),
      })
      return null
    }
  }

  /** Básico, mensaje 51. */
  public obtenerDatosEntregaTs = (): DatosEntregaTs | null => this.obtenerEstado().datosEntrega

  /** El cliente edita el formulario: se guarda en memoria y se limpia el error del campo. */
  public actualizarDatosEntrega = (cambios: Partial<DatosEntregaTs>): void => {
    const actuales = this.obtenerEstado().datosEntrega
      ?? PedidoVentaMapper.convertirDatosEntregaDTOaDatosEntregaTs(null)
    const erroresCampo = { ...this.obtenerEstado().erroresCampo }
    for (const campo of Object.keys(cambios)) delete erroresCampo[campo as CampoDatosEntrega]
    this.actualizar({ datosEntrega: { ...actuales, ...cambios }, erroresCampo })
  }

  /** A5 · Datos de entrega incompletos. Devuelve true si se puede continuar al pago. */
  public validarDatosEntrega = (): boolean => {
    const datos = this.obtenerEstado().datosEntrega
    const erroresCampo: ErroresDatosEntregaTs = {}
    for (const campo of OBLIGATORIOS) {
      if (!datos || datos[campo].trim() === '') erroresCampo[campo] = 'Este campo es obligatorio.'
    }
    if (datos && datos.telefono.trim() !== '' && soloDigitos(datos.telefono).length !== DIGITOS_TELEFONO) {
      erroresCampo.telefono = `El teléfono debe tener ${DIGITOS_TELEFONO} dígitos.`
    }
    this.actualizar({ erroresCampo })
    return Object.keys(erroresCampo).length === 0
  }

  public reiniciar = (): void => {
    this.establecer(ESTADO_INICIAL)
  }
}
