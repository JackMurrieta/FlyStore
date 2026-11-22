import type {
    CatalogoRespuestaDTO,
    PrecioProductoDTO,
    ProductoCatalogoDTO,
    VarianteDTO,
} from '../dto/CatalogoRespuestaDTO'
import type { OpcionesFiltroRespuestaDTO } from '../dto/OpcionesFiltroRespuestaDTO'
import type { ProductoDetalleRespuestaDTO } from '../dto/ProductoDetalleRespuestaDTO'
import type { DetalleProductoTs } from '../../dominio/DetalleProductoTs'
import type { OpcionesFiltroTs } from '../../dominio/OpcionesFiltroTs'
import type {
    PrecioNivelTs,
    ProductoCatalogoTs,
    VarianteTs,
} from '../../dominio/ProductoCatalogoTs'

function mapearPrecios(precios?: PrecioProductoDTO[]): PrecioNivelTs[] {
    return (precios ?? []).map((p) => ({
        tipoPrecio: p.tipoPrecio,
        precio: Number(p.precio ?? 0),
        cantidadMinima: p.minPiezas,
    }))
}

function mapearVariantes(variantes?: VarianteDTO[], prefijoId = ''): VarianteTs[] {
    return (variantes ?? []).map((v, indice) => {
        const stock = Number(v.stock ?? 0)
        const talla = v.talla || 'Única'
        const color = v.color || ''
        const sku = `${prefijoId ? `${prefijoId}-` : ''}${talla}-${color || indice}`

        return {
            id: `${indice}-${sku}`,
            sku,
            talla,
            color,
            stock,
            activa: stock > 0,
        }
    })
}

function mapearProducto(dto: ProductoCatalogoDTO): ProductoCatalogoTs {
    const precios = mapearPrecios(dto.preciosProducto)
    const variantes = mapearVariantes(dto.variantes, dto.clave || dto.idProducto)
    const precioBase =
        precios.find((p) => p.tipoPrecio.toUpperCase() === 'BASE')?.precio ??
        precios[0]?.precio ??
        0

    return {
        id: String(dto.idProducto),
        clave: dto.clave ?? '',
        nombre: dto.nombre,
        descripcion: '',
        marca: dto.marca ?? '',
        categoria: dto.categoria ?? '',
        subcategoria: dto.subcategoria ?? '',
        imagenPrincipal: dto.img ?? '',
        precioBase,
        precios,
        variantes,
        disponible: variantes.some((v) => v.activa && v.stock > 0),
    }
}

export class CatalogoMapper {
    public convertirRespuestaACatalogo(dto: CatalogoRespuestaDTO): ProductoCatalogoTs[] {
        return (dto.productos ?? []).map(mapearProducto)
    }

    public aProductoCatalogoTs(dto: CatalogoRespuestaDTO): ProductoCatalogoTs[] {
        return this.convertirRespuestaACatalogo(dto)
    }

    public convertirRespuestaAOpcionesFiltro(
        dto: OpcionesFiltroRespuestaDTO | null
    ): OpcionesFiltroTs {
        return {
            categorias: (dto?.categorias ?? []).map((c) => ({
                id: String(c.id),
                nombre: c.nombre,
            })),
            marcas: (dto?.marcas ?? []).map((m) => ({
                id: String(m.id),
                nombre: m.nombre,
            })),
        }
    }

    public convertirRespuestaADetalle(dto: ProductoDetalleRespuestaDTO): DetalleProductoTs {
        return {
            idProducto: String(dto.idProducto),
            nombre: dto.nombre,
            descripcion: dto.descripcion ?? '',
            estado: dto.estado ?? '',
            marca: dto.marca ? { id: String(dto.marca.id), nombre: dto.marca.nombre } : null,
            categoria: dto.categoria
                ? { id: String(dto.categoria.id), nombre: dto.categoria.nombre }
                : null,
            subcategoria: dto.subcategoria
                ? { id: String(dto.subcategoria.id), nombre: dto.subcategoria.nombre }
                : null,
            imagenes: dto.imagenes ?? [],
            precios: mapearPrecios(dto.precios),
            variantes: mapearVariantes(dto.variantes, String(dto.idProducto)),
            disponible: Boolean(dto.disponible),
        }
    }
}