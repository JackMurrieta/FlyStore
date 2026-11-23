/**
 * CatalogoEnCursoModel · Experto en el catálogo que se está viendo (GRASP).
 *
 * Una sola fuente para las marcas de la línea (B2), el catálogo con filtros y orden (B3), la búsqueda
 * (S1) y «Ver más productos» (S3): todos son la misma consulta con distinto destino o criterios.
 * Guarda lo ya cargado: al regresar de la ficha con los mismos criterios no vuelve a pedirlo, así se
 * conservan las páginas cargadas y la posición (Figma S2 «Regresar al catálogo»).
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type {
  LineaConteoTs, LineaTs, OpcionesFiltroTs, PaginaCatalogoTs, ProductoTarjetaTs, TipoPrecioTs,
} from '../dominio/CatalogoTs'
import type { CriteriosBusquedaTs, DestinoCatalogoTs } from '../dominio/CriteriosBusquedaTs'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'
import { CRITERIOS_VACIOS, claveConsulta, validarTextoBusqueda } from '../dominio/ReglasCatalogo'
import { CatalogoMapper } from './mappers/CatalogoMapper'

export interface EstadoCatalogo {
  readonly destino: DestinoCatalogoTs | null
  readonly criterios: CriteriosBusquedaTs
  /** Clave de la consulta cargada (destino + criterios). */
  readonly clave: string | null
  readonly linea: LineaTs | null
  readonly productos: readonly ProductoTarjetaTs[]
  readonly opciones: OpcionesFiltroTs | null
  readonly total: number
  readonly pagina: number
  readonly hayMas: boolean
  readonly tipoPrecioReferencia: TipoPrecioTs | null
  readonly sugerencias: readonly ProductoTarjetaTs[]
  readonly lineas: readonly LineaConteoTs[]
  /** Primera página (esqueletos en toda la cuadrícula). */
  readonly cargando: boolean
  /** «Ver más productos» (marcadores al final de la lista). */
  readonly cargandoMas: boolean
  /** A4 · no se pudo cargar la consulta. */
  readonly error: ErrorTs | null
  /** No se pudo cargar el siguiente bloque; lo ya cargado se queda. */
  readonly errorMas: ErrorTs | null
}

const ESTADO_INICIAL: EstadoCatalogo = {
  destino: null,
  criterios: CRITERIOS_VACIOS,
  clave: null,
  linea: null,
  productos: [],
  opciones: null,
  total: 0,
  pagina: 0,
  hayMas: false,
  tipoPrecioReferencia: null,
  sugerencias: [],
  lineas: [],
  cargando: false,
  cargandoMas: false,
  error: null,
  errorMas: null,
}

const destinoComoTexto = (destino: DestinoCatalogoTs): string =>
  destino.tipo === 'linea' ? `linea:${destino.ruta.toLowerCase()}` : `busqueda:${destino.linea ?? ''}`

export class CatalogoEnCursoModel extends ModeloObservable<EstadoCatalogo> {
  private readonly gateway: ICatalogoGateway
  /** Cada consulta tiene su número; una respuesta vieja no pisa a una más reciente. */
  private solicitud = 0

  constructor(gateway: ICatalogoGateway) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
  }

  /**
   * Carga la primera página del destino con esos criterios. Si ya está cargada (regreso de la ficha),
   * no hace nada. En la búsqueda, un texto vacío no consulta (A1).
   */
  public cargar = async (destino: DestinoCatalogoTs, criterios: CriteriosBusquedaTs): Promise<void> => {
    const clave = claveConsulta(destinoComoTexto(destino), criterios)
    const actual = this.obtenerEstado()
    if (actual.clave === clave && (actual.cargando || (actual.opciones !== null && actual.error === null))) return

    if (destino.tipo === 'busqueda') {
      const mensaje = validarTextoBusqueda(criterios.texto)
      if (mensaje) {
        this.solicitud++
        this.establecer({ ...ESTADO_INICIAL, destino, criterios, clave, error: { mensaje, tipo: 'validacion' } })
        return
      }
    }

    const numero = ++this.solicitud
    // Al cambiar solo filtros u orden se conservan las opciones (el panel no parpadea).
    const mismaLinea = actual.destino !== null && destinoComoTexto(actual.destino) === destinoComoTexto(destino)
    this.establecer({
      ...ESTADO_INICIAL,
      destino,
      criterios,
      clave,
      linea: mismaLinea ? actual.linea : null,
      opciones: mismaLinea ? actual.opciones : null,
      lineas: mismaLinea ? actual.lineas : [],
      cargando: true,
    })
    try {
      const pagina = await this.consultar(destino, criterios, 0)
      if (numero !== this.solicitud) return
      this.aplicarPagina(pagina, false)
    } catch (error) {
      if (numero !== this.solicitud) return
      this.actualizar({
        cargando: false,
        error: CatalogoMapper.aErrorTs(error, 'No fue posible cargar los productos. Inténtalo de nuevo.'),
      })
    }
  }

  /** S3 · Siguiente bloque de 30 sin perder filtros ni orden. */
  public cargarMas = async (): Promise<void> => {
    const estado = this.obtenerEstado()
    if (!estado.destino || !estado.hayMas || estado.cargando || estado.cargandoMas) return
    const numero = this.solicitud
    this.actualizar({ cargandoMas: true, errorMas: null })
    try {
      const pagina = await this.consultar(estado.destino, estado.criterios, estado.pagina + 1)
      if (numero !== this.solicitud) return
      this.aplicarPagina(pagina, true)
    } catch (error) {
      if (numero !== this.solicitud) return
      this.actualizar({
        cargandoMas: false,
        errorMas: CatalogoMapper.aErrorTs(error, 'No pudimos cargar más productos. Inténtalo de nuevo.'),
      })
    }
  }

  /** A4 · «Reintentar» la última consulta. */
  public reintentar = async (): Promise<void> => {
    const { destino, criterios } = this.obtenerEstado()
    if (!destino) return
    this.actualizar({ clave: null })
    await this.cargar(destino, criterios)
  }

  /** Olvida lo cargado: al iniciar o cerrar sesión cambian los precios de referencia. */
  public invalidar = (): void => {
    this.solicitud++
    this.actualizar({ clave: null, cargando: false, cargandoMas: false })
  }

  public reiniciar = (): void => {
    this.solicitud++
    this.establecer(ESTADO_INICIAL)
  }

  private consultar(destino: DestinoCatalogoTs, criterios: CriteriosBusquedaTs, pagina: number): Promise<PaginaCatalogoTs> {
    const respuesta = destino.tipo === 'linea'
      ? this.gateway.consultarLinea(destino.ruta, criterios, pagina)
      : this.gateway.buscar(criterios, destino.linea, pagina)
    return respuesta.then(CatalogoMapper.aPaginaCatalogoTs)
  }

  private aplicarPagina(pagina: PaginaCatalogoTs, agregar: boolean): void {
    const anteriores = agregar ? this.obtenerEstado().productos : []
    const vistos = new Set(anteriores.map(p => p.id))
    this.actualizar({
      linea: pagina.linea,
      productos: [...anteriores, ...pagina.productos.filter(p => !vistos.has(p.id))],
      opciones: pagina.opciones,
      total: pagina.total,
      pagina: pagina.pagina,
      hayMas: pagina.hayMas,
      tipoPrecioReferencia: pagina.tipoPrecioReferencia,
      sugerencias: agregar ? this.obtenerEstado().sugerencias : pagina.sugerencias,
      lineas: pagina.lineas,
      cargando: false,
      cargandoMas: false,
      error: null,
      errorMas: null,
    })
  }
}
