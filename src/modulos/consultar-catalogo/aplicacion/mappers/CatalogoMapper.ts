/**
 * DTO del backend → tipos de las vistas (CU-01). Métodos estáticos y sin estado, como los demás mappers.
 */

import { ErrorApi } from '@infraestructura/http/ErrorApi'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type {
  CatalogoRespuestaDTO, LineaDTO, OpcionesFiltroRespuestaDTO, PrecioReferenciaDTO, ProductoTarjetaDTO,
} from '../dto/CatalogoRespuestaDTO'
import type { ProductoDetalleRespuestaDTO } from '../dto/ProductoDetalleRespuestaDTO'
import type {
  LineaTs, OpcionesFiltroTs, OrdenCatalogoTs, PaginaCatalogoTs, PrecioReferenciaTs, ProductoTarjetaTs, TipoPrecioTs,
} from '../../dominio/CatalogoTs'
import type { DetalleProductoTs } from '../../dominio/DetalleProductoTs'
import { ORDENES, esTipoPrecio, etiquetaTipoPrecio } from '../../dominio/ReglasCatalogo'

const ORDENES_POR_DEFECTO: { valor: OrdenCatalogoTs; etiqueta: string }[] = [
  { valor: 'RECIENTES', etiqueta: 'Más recientes' },
  { valor: 'PRECIO_ASC', etiqueta: 'Precio: menor a mayor' },
  { valor: 'PRECIO_DESC', etiqueta: 'Precio: mayor a menor' },
  { valor: 'NOMBRE_ASC', etiqueta: 'Nombre A–Z' },
  { valor: 'MAS_VENDIDOS', etiqueta: 'Más vendidos' },
]

const numero = (valor: unknown, respaldo = 0): number => {
  const n = typeof valor === 'number' ? valor : Number(valor)
  return Number.isFinite(n) ? n : respaldo
}

const tipoPrecio = (valor: string | null | undefined): TipoPrecioTs => (valor && esTipoPrecio(valor) ? valor : 'BASE')

export class CatalogoMapper {
  static aLineaTs(dto: LineaDTO): LineaTs {
    return { id: dto.id, nombre: (dto.nombre ?? '').trim(), ruta: dto.ruta, logoUrl: dto.logoUrl ?? null }
  }

  static aPrecioReferenciaTs(dto: PrecioReferenciaDTO | null): PrecioReferenciaTs | null {
    if (!dto) return null
    const tipo = tipoPrecio(dto.tipoPrecio)
    return { tipoPrecio: tipo, etiqueta: etiquetaTipoPrecio(tipo), precio: numero(dto.precio), minPiezas: Math.max(1, numero(dto.minPiezas, 1)) }
  }

  static aProductoTarjetaTs(dto: ProductoTarjetaDTO): ProductoTarjetaTs {
    return {
      id: dto.idProducto,
      clave: dto.clave ?? '',
      nombre: dto.nombre ?? '',
      marca: dto.marca ?? '',
      subcategoria: dto.subcategoria ?? '',
      imagenUrl: dto.imagenUrl || null,
      precio: CatalogoMapper.aPrecioReferenciaTs(dto.precio),
      colores: (dto.colores ?? []).map(c => ({ idColor: c.idColor, nombre: c.nombre ?? '', hex: c.hex || null, imagenUrl: c.imagenUrl || null })),
      idColorDestacado: dto.idColorDestacado ?? null,
    }
  }

  static aOpcionesFiltroTs(dto: OpcionesFiltroRespuestaDTO | null | undefined): OpcionesFiltroTs {
    const ordenes = (dto?.ordenes ?? [])
      .filter(o => (ORDENES as readonly string[]).includes(o.id))
      .map(o => ({ valor: o.id as OrdenCatalogoTs, etiqueta: o.nombre }))
    return {
      marcas: (dto?.marcas ?? []).map(m => ({ id: m.id, nombre: m.nombre, cantidad: numero(m.cantidad), logoUrl: m.logoUrl || null })),
      subcategorias: (dto?.subcategorias ?? []).map(s => ({ id: s.id, nombre: s.nombre, cantidad: numero(s.cantidad) })),
      colores: (dto?.colores ?? []).map(c => ({ id: c.id, nombre: c.nombre, cantidad: numero(c.cantidad), hex: c.hex || null })),
      tiposTalla: (dto?.tiposTalla ?? []).map(t => ({
        id: t.id, nombre: t.nombre, unidadMedida: t.unidadMedida || null,
        tallas: (t.tallas ?? []).map(o => ({ id: o.id, nombre: o.nombre, cantidad: numero(o.cantidad) })),
      })),
      unidadesMedida: dto?.unidadesMedida ?? [],
      precioMinimo: dto?.rangoPrecio?.minimo ?? null,
      precioMaximo: dto?.rangoPrecio?.maximo ?? null,
      ordenes: ordenes.length > 0 ? ordenes : ORDENES_POR_DEFECTO,
    }
  }

  static aPaginaCatalogoTs(dto: CatalogoRespuestaDTO): PaginaCatalogoTs {
    return {
      linea: dto.linea ? CatalogoMapper.aLineaTs(dto.linea) : null,
      productos: (dto.productos ?? []).map(CatalogoMapper.aProductoTarjetaTs),
      opciones: CatalogoMapper.aOpcionesFiltroTs(dto.opcionesFiltro),
      pagina: numero(dto.pagina),
      tamanoPagina: numero(dto.tamanoPagina, 30),
      total: numero(dto.total),
      hayMas: Boolean(dto.hayMas),
      tipoPrecioReferencia: tipoPrecio(dto.tipoPrecioReferencia),
      sugerencias: (dto.sugerencias ?? []).map(CatalogoMapper.aProductoTarjetaTs),
      lineas: (dto.lineas ?? []).map(l => ({ id: l.id, nombre: (l.nombre ?? '').trim(), ruta: l.ruta, cantidad: numero(l.cantidad) })),
    }
  }

  static aDetalleProductoTs(dto: ProductoDetalleRespuestaDTO): DetalleProductoTs {
    const referencia = CatalogoMapper.aPrecioReferenciaTs(dto.precioReferencia)
    const precios = (dto.precios ?? [])
      .map(p => {
        const tipo = tipoPrecio(p.tipoPrecio)
        return { tipoPrecio: tipo, etiqueta: etiquetaTipoPrecio(tipo), minPiezas: Math.max(1, numero(p.minPiezas, 1)), precio: numero(p.precio), referencia: Boolean(p.referencia) }
      })
      .sort((a, b) => a.minPiezas - b.minPiezas || a.precio - b.precio)
    return {
      id: dto.idProducto,
      clave: dto.clave ?? '',
      nombre: dto.nombre ?? '',
      descripcion: dto.descripcion ?? '',
      linea: CatalogoMapper.aLineaTs(dto.linea),
      marca: dto.marca,
      subcategoria: dto.subcategoria,
      imagenes: (dto.imagenes ?? [])
        .filter(i => Boolean(i.url))
        .map((i, indice) => ({ url: i.url, idColor: i.idColor ?? null, orden: i.orden ?? indice })),
      variantes: (dto.variantes ?? []).map(v => ({
        id: v.idVariante,
        sku: v.sku ?? '',
        idColor: v.idColor ?? null,
        color: v.color ?? 'Único',
        hex: v.hex || null,
        idTalla: v.idTalla ?? null,
        talla: v.talla || null,
        tipoTalla: v.tipoTalla || null,
        unidadMedida: v.unidadMedida || null,
        existencia: Math.max(0, numero(v.existencia)),
        disponible: Boolean(v.disponible) && numero(v.existencia) > 0,
      })),
      precios,
      precioReferencia: referencia ?? { tipoPrecio: 'BASE', etiqueta: 'Base', precio: precios[0]?.precio ?? 0, minPiezas: 1 },
      cantidadInicial: Math.max(1, numero(dto.cantidadInicial, 1)),
      existenciaTotal: Math.max(0, numero(dto.existenciaTotal)),
      disponible: Boolean(dto.disponible),
    }
  }

  /** Errores del backend → mensaje para la vista (A4: error de conexión o de base de datos). */
  static aErrorTs(error: unknown, respaldo: string): ErrorTs {
    if (error instanceof ErrorApi) {
      if (error.tipo === 'RED') return { mensaje: 'Revisa tu conexión e inténtalo de nuevo.', tipo: 'red' }
      if (error.statusHTTP === 404) return { mensaje: error.message || respaldo, tipo: 'negocio' }
      if (error.statusHTTP && error.statusHTTP >= 500) return { mensaje: respaldo, tipo: 'desconocido' }
      return { mensaje: error.message || respaldo, tipo: error.tipo === 'VALIDACION' ? 'validacion' : 'negocio' }
    }
    if (error instanceof TypeError) return { mensaje: 'Revisa tu conexión e inténtalo de nuevo.', tipo: 'red' }
    return { mensaje: respaldo, tipo: 'desconocido' }
  }
}
