import { ModeloObservable } from '../../../compartido/modelo/ModeloObservable'
import { ErrorApi } from '../../../infraestructura/http/ErrorApi'
import type { CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'
import type { DetalleProductoTs } from '../dominio/DetalleProductoTs'
import type { OpcionesFiltroTs } from '../dominio/OpcionesFiltroTs'
import type { ProductoCatalogoTs } from '../dominio/ProductoCatalogoTs'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'
import { CatalogoMapper } from './mappers/CatalogoMapper'

export interface EstadoCatalogoTs {
    productosBase: ProductoCatalogoTs[]
    productosVisibles: ProductoCatalogoTs[]
    opcionesFiltro: OpcionesFiltroTs
    criterios: CriteriosBusquedaTs
    cargandoCatalogo: boolean
    errorCatalogo: string | null
    sinResultados: boolean
    detalleActual: DetalleProductoTs | null
    cargandoDetalle: boolean
    errorDetalle: string | null
}

const ESTADO_INICIAL: EstadoCatalogoTs = {
    productosBase: [],
    productosVisibles: [],
    opcionesFiltro: { categorias: [], marcas: [] },
    criterios: { orden: 'precio-asc', soloConExistencia: false },
    cargandoCatalogo: false,
    errorCatalogo: null,
    sinResultados: false,
    detalleActual: null,
    cargandoDetalle: false,
    errorDetalle: null,
}

export class CatalogoEnCursoModel extends ModeloObservable<EstadoCatalogoTs> {
    private readonly gateway: ICatalogoGateway
    private readonly mapper: CatalogoMapper

    constructor(gateway: ICatalogoGateway, mapper = new CatalogoMapper()) {
        super(ESTADO_INICIAL)
        this.gateway = gateway
        this.mapper = mapper
    }

    public async cargarCatalogoInicial(): Promise<void> {
        this.actualizar({ cargandoCatalogo: true, errorCatalogo: null })

        try {
            const respuesta = await this.gateway.obtenerCatalogoInicial()
            const productosTs = this.mapper.convertirRespuestaACatalogo(respuesta)
            const opcionesFiltroTs = this.mapper.convertirRespuestaAOpcionesFiltro(
                respuesta.opcionesFiltro
            )
            const criteriosLimpios: CriteriosBusquedaTs = {
                orden: 'precio-asc',
                soloConExistencia: false,
            }
            const visibles = this.aplicarFiltrosLocales(productosTs, criteriosLimpios)

            this.actualizar({
                productosBase: productosTs,
                productosVisibles: visibles,
                opcionesFiltro: opcionesFiltroTs,
                criterios: criteriosLimpios,
                cargandoCatalogo: false,
                errorCatalogo: null,
                sinResultados: visibles.length === 0,
            })
        } catch (error) {
            this.actualizar({
                cargandoCatalogo: false,
                errorCatalogo: this.obtenerMensajeError(
                    error,
                    'No pudimos cargar los productos. Verifica tu conexión e intenta de nuevo.'
                ),
            })
        }
    }

    public validarAlMenosUnFiltro(criterioTs: CriteriosBusquedaTs): boolean {
        const tieneTermino = Boolean(criterioTs.termino?.trim())
        const tieneCategoria = Boolean(criterioTs.idCategoria?.trim())
        return tieneTermino || tieneCategoria
    }

    public async filtrarCatalogo(criterios: CriteriosBusquedaTs): Promise<void> {
        const criteriosCombinados: CriteriosBusquedaTs = {
            ...this.obtenerEstado().criterios,
            ...criterios,
        }

        // Si no hay término ni categoría para consultar al backend, recarga inicial o filtra local
        if (!this.validarAlMenosUnFiltro(criteriosCombinados)) {
            if (this.obtenerEstado().productosBase.length === 0) {
                await this.cargarCatalogoInicial()
                return
            }
            const visibles = this.aplicarFiltrosLocales(
                this.obtenerEstado().productosBase,
                criteriosCombinados
            )
            this.actualizar({
                criterios: criteriosCombinados,
                productosVisibles: visibles,
                sinResultados: visibles.length === 0,
                errorCatalogo: null,
            })
            return
        }

        this.actualizar({
            cargandoCatalogo: true,
            errorCatalogo: null,
            criterios: criteriosCombinados,
        })

        try {
            const respuesta = await this.gateway.buscarProductos(criteriosCombinados)
            const productosFiltradosTs = this.mapper.aProductoCatalogoTs(respuesta)
            const visibles = this.aplicarFiltrosLocales(productosFiltradosTs, criteriosCombinados)

            this.actualizar({
                productosBase: productosFiltradosTs,
                productosVisibles: visibles,
                cargandoCatalogo: false,
                errorCatalogo: null,
                sinResultados: visibles.length === 0,
            })
        } catch (error) {
            this.actualizar({
                cargandoCatalogo: false,
                errorCatalogo: this.obtenerMensajeError(
                    error,
                    'No pudimos realizar la búsqueda en el catálogo.'
                ),
            })
        }
    }

    public actualizarFiltrosVisuales(cambios: Partial<CriteriosBusquedaTs>): void {
        const criterios = { ...this.obtenerEstado().criterios, ...cambios }
        const visibles = this.aplicarFiltrosLocales(this.obtenerEstado().productosBase, criterios)
        this.actualizar({
            criterios,
            productosVisibles: visibles,
            sinResultados: visibles.length === 0,
        })
    }

    public async limpiarFiltros(): Promise<void> {
        await this.cargarCatalogoInicial()
    }

    public async obtenerDetalles(idProducto: string): Promise<void> {
        this.actualizar({
            cargandoDetalle: true,
            errorDetalle: null,
            detalleActual: null,
        })

        try {
            const dto = await this.gateway.obtenerDetalleProducto(idProducto)
            const detalleTs = this.mapper.convertirRespuestaADetalle(dto)
            this.actualizar({
                detalleActual: detalleTs,
                cargandoDetalle: false,
                errorDetalle: null,
            })
        } catch (error) {
            this.actualizar({
                cargandoDetalle: false,
                errorDetalle: this.obtenerMensajeError(
                    error,
                    'No pudimos cargar el detalle del producto.'
                ),
            })
        }
    }

    private aplicarFiltrosLocales(
        productos: ProductoCatalogoTs[],
        criterios: CriteriosBusquedaTs
    ): ProductoCatalogoTs[] {
        let lista = [...productos]

        if (criterios.marcas && criterios.marcas.length > 0) {
            const seleccionadas = criterios.marcas.map((m) => m.toLowerCase())
            lista = lista.filter((p) => seleccionadas.includes(p.marca.toLowerCase()))
        }

        if (criterios.subcategoria?.trim()) {
            const sub = criterios.subcategoria.trim().toLowerCase()
            lista = lista.filter((p) => p.subcategoria.toLowerCase() === sub)
        }

        if (criterios.color?.trim()) {
            const color = criterios.color.trim().toLowerCase()
            lista = lista.filter((p) =>
                p.variantes.some((v) => v.color.toLowerCase() === color)
            )
        }

        if (criterios.precioMin !== undefined) {
            lista = lista.filter((p) => p.precioBase >= criterios.precioMin!)
        }

        if (criterios.precioMax !== undefined) {
            lista = lista.filter((p) => p.precioBase <= criterios.precioMax!)
        }

        if (criterios.soloConExistencia) {
            lista = lista.filter((p) => p.disponible)
        }

        if (criterios.orden === 'precio-asc') {
            lista.sort((a, b) => a.precioBase - b.precioBase)
        } else if (criterios.orden === 'precio-desc') {
            lista.sort((a, b) => b.precioBase - a.precioBase)
        } else if (criterios.orden === 'nombre-asc') {
            lista.sort((a, b) => a.nombre.localeCompare(b.nombre))
        }

        return lista
    }

    private obtenerMensajeError(error: unknown, respaldo: string): string {
        if (error instanceof ErrorApi) return error.message
        if (error instanceof Error && error.message) return error.message
        return respaldo
    }
}