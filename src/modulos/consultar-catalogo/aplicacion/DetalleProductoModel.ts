/**
 * DetalleProductoModel · Ficha del producto (S2) y «Agregar al carrito», donde CU-01 se liga con CU-02.
 *
 * Guarda la variante elegida (color + talla) y la cantidad. Para agregar se necesita sesión de cliente:
 * sin sesión guarda lo elegido como pendiente y pide iniciar sesión o crear cuenta; al volver a la ficha
 * ya con sesión, lo agrega solo. El carrito (PedidoVenta PENDIENTE) lo crea el backend al agregar.
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import type { DetalleProductoTs, VarianteVentaTs } from '../dominio/DetalleProductoTs'
import type { IAgregadoPendiente } from '../dominio/puertos/IAgregadoPendiente'
import type { ICarritoCatalogo } from '../dominio/puertos/ICarritoCatalogo'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'
import { limitarCantidad, varianteInicial, variantesDeColor } from '../dominio/ReglasCatalogo'
import { CatalogoMapper } from './mappers/CatalogoMapper'

/** Quién está viendo la ficha. El personal (admin/empleado) no compra en la tienda. */
export type CompradorTs = 'verificando' | 'anonimo' | 'cliente' | 'personal'

export interface AgregadoTs {
  readonly producto: string
  readonly variante: string
  readonly cantidad: number
}

export interface EstadoDetalleProducto {
  readonly idProducto: number | null
  readonly detalle: DetalleProductoTs | null
  readonly cargando: boolean
  readonly error: ErrorTs | null
  readonly idColor: number | null
  readonly idVariante: number | null
  readonly cantidad: number
  readonly agregando: boolean
  /** Toast «Agregado al carrito». */
  readonly agregado: AgregadoTs | null
  readonly errorAgregar: string | null
  /** Diálogo «Inicia sesión o crea tu cuenta». */
  readonly pideSesion: boolean
}

const ESTADO_INICIAL: EstadoDetalleProducto = {
  idProducto: null,
  detalle: null,
  cargando: false,
  error: null,
  idColor: null,
  idVariante: null,
  cantidad: 1,
  agregando: false,
  agregado: null,
  errorAgregar: null,
  pideSesion: false,
}

export const MENSAJE_PERSONAL = 'Las cuentas del personal no compran en la tienda. Entra con una cuenta de cliente para agregar productos.'

export class DetalleProductoModel extends ModeloObservable<EstadoDetalleProducto> {
  private readonly gateway: ICatalogoGateway
  private readonly carrito: ICarritoCatalogo
  private readonly pendientes: IAgregadoPendiente
  private solicitud = 0
  private idColorPreferido: number | null = null

  constructor(gateway: ICatalogoGateway, carrito: ICarritoCatalogo, pendientes: IAgregadoPendiente) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
    this.carrito = carrito
    this.pendientes = pendientes
  }

  /**
   * Carga la ficha. {@code idColorPreferido} es el color que la persona tenía elegido en la tarjeta.
   * Si hay un «Agregar» pendiente de este producto, se recupera la variante y la cantidad elegidas.
   */
  public cargar = async (idProducto: number, idColorPreferido: number | null = null): Promise<void> => {
    const numero = ++this.solicitud
    this.idColorPreferido = idColorPreferido
    this.establecer({ ...ESTADO_INICIAL, idProducto, cargando: true })
    try {
      const detalle = CatalogoMapper.aDetalleProductoTs(await this.gateway.obtenerProducto(idProducto))
      if (numero !== this.solicitud) return
      const pendiente = this.pendientes.obtener()
      const variantePendiente = pendiente?.idProducto === idProducto
        ? detalle.variantes.find(v => v.id === pendiente.idVariante && v.disponible) ?? null
        : null
      const variante = variantePendiente ?? varianteInicial(detalle.variantes, idColorPreferido)
      const cantidad = variantePendiente && pendiente ? pendiente.cantidad : detalle.cantidadInicial
      this.actualizar({
        detalle,
        cargando: false,
        idColor: variante?.idColor ?? null,
        idVariante: variante?.id ?? null,
        cantidad: limitarCantidad(cantidad, variante?.existencia ?? 1),
      })
    } catch (error) {
      if (numero !== this.solicitud) return
      this.actualizar({
        cargando: false,
        error: CatalogoMapper.aErrorTs(error, 'No pudimos cargar el producto. Inténtalo de nuevo.'),
      })
    }
  }

  /** Cambia de color y elige su primera talla con existencia (o la primera, que saldrá «Agotado»). */
  public elegirColor = (idColor: number | null): void => {
    const { detalle, cantidad } = this.obtenerEstado()
    if (!detalle) return
    const variantes = variantesDeColor(detalle.variantes, idColor)
    const variante = variantes.find(v => v.disponible) ?? variantes[0] ?? null
    this.actualizar({
      idColor,
      idVariante: variante?.id ?? null,
      cantidad: limitarCantidad(cantidad, variante?.existencia ?? 1),
      errorAgregar: null,
    })
  }

  public elegirVariante = (idVariante: number): void => {
    const variante = this.obtenerEstado().detalle?.variantes.find(v => v.id === idVariante)
    if (!variante) return
    this.actualizar({
      idColor: variante.idColor,
      idVariante: variante.id,
      cantidad: limitarCantidad(this.obtenerEstado().cantidad, variante.existencia),
      errorAgregar: null,
    })
  }

  public cambiarCantidad = (cantidad: number): void => {
    const variante = this.varianteElegida()
    this.actualizar({ cantidad: limitarCantidad(cantidad, variante?.existencia ?? 1), errorAgregar: null })
  }

  /** «Agregar al carrito». Sin sesión deja el agregado pendiente y pide iniciar sesión o crear cuenta. */
  public agregarAlCarrito = async (comprador: CompradorTs): Promise<void> => {
    const { detalle, cantidad, agregando } = this.obtenerEstado()
    const variante = this.varianteElegida()
    if (!detalle || !variante || agregando || comprador === 'verificando') return
    if (!variante.disponible) {
      this.actualizar({ errorAgregar: 'Esta variante está agotada. Elige otro color o talla.' })
      return
    }
    if (comprador === 'personal') {
      this.actualizar({ errorAgregar: MENSAJE_PERSONAL })
      return
    }
    if (comprador === 'anonimo') {
      this.pendientes.guardar({ idProducto: detalle.id, idVariante: variante.id, cantidad })
      this.actualizar({ pideSesion: true, errorAgregar: null })
      return
    }
    await this.enviar(detalle, variante, cantidad)
  }

  /** Al volver de iniciar sesión o confirmar la cuenta: agrega lo que quedó pendiente de esta ficha. */
  public completarPendiente = async (comprador: CompradorTs): Promise<void> => {
    const { detalle, agregando } = this.obtenerEstado()
    const pendiente = this.pendientes.obtener()
    if (!detalle || agregando || !pendiente || pendiente.idProducto !== detalle.id) return
    if (comprador === 'personal') {
      this.pendientes.limpiar()
      this.actualizar({ errorAgregar: MENSAJE_PERSONAL })
      return
    }
    if (comprador !== 'cliente') return
    const variante = detalle.variantes.find(v => v.id === pendiente.idVariante)
    if (!variante || !variante.disponible) {
      this.pendientes.limpiar()
      this.actualizar({ errorAgregar: 'La variante que elegiste se agotó mientras iniciabas sesión. Elige otra.' })
      return
    }
    const cantidad = limitarCantidad(pendiente.cantidad, variante.existencia)
    this.actualizar({ idColor: variante.idColor, idVariante: variante.id, cantidad })
    await this.enviar(detalle, variante, cantidad)
  }

  /**
   * Al iniciar o cerrar sesión cambian los precios de referencia: vuelve a pedir la ficha que se está
   * viendo sin perder el color, la talla, la cantidad, el aviso de sesión ni el toast.
   */
  public refrescar = async (): Promise<void> => {
    const { idProducto, detalle, cargando } = this.obtenerEstado()
    if (idProducto === null) return
    if (cargando || !detalle) {
      await this.cargar(idProducto, this.idColorPreferido)
      return
    }
    const numero = ++this.solicitud
    try {
      const nuevo = CatalogoMapper.aDetalleProductoTs(await this.gateway.obtenerProducto(idProducto))
      if (numero !== this.solicitud) return
      const { idVariante, idColor, cantidad } = this.obtenerEstado()
      const variante = nuevo.variantes.find(v => v.id === idVariante) ?? varianteInicial(nuevo.variantes, idColor)
      this.actualizar({
        detalle: nuevo,
        idColor: variante?.idColor ?? null,
        idVariante: variante?.id ?? null,
        cantidad: limitarCantidad(cantidad, variante?.existencia ?? 1),
      })
    } catch {
      // Se queda la ficha que ya se ve; el carrito vuelve a calcular el precio al agregar.
    }
  }

  public cerrarDialogoSesion = (): void => this.actualizar({ pideSesion: false })

  public cerrarAgregado = (): void => this.actualizar({ agregado: null })

  public reiniciar = (): void => {
    this.solicitud++
    this.establecer(ESTADO_INICIAL)
  }

  private varianteElegida(): VarianteVentaTs | null {
    const { detalle, idVariante } = this.obtenerEstado()
    return detalle?.variantes.find(v => v.id === idVariante) ?? null
  }

  private async enviar(detalle: DetalleProductoTs, variante: VarianteVentaTs, cantidad: number): Promise<void> {
    this.actualizar({ agregando: true, errorAgregar: null, agregado: null, pideSesion: false })
    try {
      await this.carrito.agregar(variante.id, cantidad)
      this.pendientes.limpiar()
      const descripcion = [variante.color, variante.talla].filter(Boolean).join(' · ')
      this.actualizar({ agregando: false, agregado: { producto: detalle.nombre, variante: descripcion, cantidad } })
    } catch (error) {
      if (error instanceof ErrorApi && error.statusHTTP === 401) {
        // La sesión venció: se guarda lo elegido y se pide entrar de nuevo.
        this.pendientes.guardar({ idProducto: detalle.id, idVariante: variante.id, cantidad })
        this.actualizar({ agregando: false, pideSesion: true })
        return
      }
      this.pendientes.limpiar()
      const mensaje = error instanceof ErrorApi && error.statusHTTP === 403
        ? MENSAJE_PERSONAL
        : CatalogoMapper.aErrorTs(error, 'No pudimos agregar el producto. Inténtalo de nuevo.').mensaje
      this.actualizar({ agregando: false, errorAgregar: mensaje })
    }
  }
}
