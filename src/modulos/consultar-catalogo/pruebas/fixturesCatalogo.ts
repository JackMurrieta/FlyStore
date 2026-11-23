/** Datos de prueba del CU-01 (no se usan en producción). Basados en el Figma: gorras New Era a precio Mayoreo. */
import { vi } from 'vitest'
import type { CatalogoRespuestaDTO, ProductoTarjetaDTO } from '../aplicacion/dto/CatalogoRespuestaDTO'
import type { ProductoDetalleRespuestaDTO } from '../aplicacion/dto/ProductoDetalleRespuestaDTO'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'
import type { AgregadoPendienteTs, IAgregadoPendiente } from '../dominio/puertos/IAgregadoPendiente'
import type { ICarritoCatalogo } from '../dominio/puertos/ICarritoCatalogo'

export function tarjeta(id: number, nombre: string, extra: Partial<ProductoTarjetaDTO> = {}): ProductoTarjetaDTO {
  return {
    idProducto: id, clave: `NE-${id}`, nombre, marca: 'New Era', subcategoria: 'Snapback',
    imagenUrl: `https://img.test/${id}.webp`, precio: { tipoPrecio: 'MAYOREO', precio: 210, minPiezas: 6 },
    colores: [
      { idColor: 1, nombre: 'Negro', hex: '#111111', imagenUrl: `https://img.test/${id}-negro.webp` },
      { idColor: 2, nombre: 'Azul', hex: '#1d4ed8', imagenUrl: `https://img.test/${id}-azul.webp` },
    ],
    ...extra,
  }
}

export function paginaCaps(extra: Partial<CatalogoRespuestaDTO> = {}): CatalogoRespuestaDTO {
  return {
    linea: { id: 1, nombre: 'CAPS', ruta: 'caps', logoUrl: null },
    productos: [tarjeta(10, '9FORTY LA Dodgers'), tarjeta(11, '59FIFTY NY Yankees', { colores: [] })],
    opcionesFiltro: {
      marcas: [
        { id: 1, nombre: 'New Era', cantidad: 2, logoUrl: 'https://img.test/new-era.svg' },
        { id: 2, nombre: 'Mitchell & Ness', cantidad: 1, logoUrl: null },
      ],
      subcategorias: [{ id: 5, nombre: 'Snapback', cantidad: 2 }],
      colores: [{ id: 1, nombre: 'Negro', cantidad: 2, hex: '#111111' }],
      tiposTalla: [{ id: 1, nombre: 'Talla', unidadMedida: null, tallas: [{ id: 7, nombre: 'Ajustable', cantidad: 2 }] }],
      unidadesMedida: [],
      rangoPrecio: { minimo: 190, maximo: 300 },
      ordenes: [{ id: 'RECIENTES', nombre: 'Más recientes' }, { id: 'PRECIO_ASC', nombre: 'Precio: menor a mayor' }],
    },
    pagina: 0, tamanoPagina: 30, total: 2, hayMas: false, tipoPrecioReferencia: 'MAYOREO', sugerencias: [], lineas: null,
    ...extra,
  }
}

export function detalleDodgers(extra: Partial<ProductoDetalleRespuestaDTO> = {}): ProductoDetalleRespuestaDTO {
  return {
    idProducto: 10, clave: 'NE-10', nombre: '9FORTY LA Dodgers', descripcion: 'Gorra ajustable.', estado: 'PUBLICADO',
    linea: { id: 1, nombre: 'CAPS', ruta: 'caps', logoUrl: null },
    marca: { id: 1, nombre: 'New Era' }, subcategoria: { id: 5, nombre: 'Snapback' },
    imagenes: [
      { url: 'https://img.test/10-negro.webp', idColor: 1, orden: 0 },
      { url: 'https://img.test/10-azul.webp', idColor: 2, orden: 1 },
    ],
    variantes: [
      { idVariante: 101, sku: 'NE10-N', idColor: 1, color: 'Negro', hex: '#111111', idTalla: 7, talla: 'Ajustable', idTipoTalla: 1, tipoTalla: 'Talla', unidadMedida: null, existencia: 18, disponible: true },
      { idVariante: 102, sku: 'NE10-A', idColor: 2, color: 'Azul', hex: '#1d4ed8', idTalla: 7, talla: 'Ajustable', idTipoTalla: 1, tipoTalla: 'Talla', unidadMedida: null, existencia: 0, disponible: false },
    ],
    precios: [
      { tipoPrecio: 'BASE', minPiezas: 1, precio: 250, referencia: false },
      { tipoPrecio: 'MAYOREO', minPiezas: 6, precio: 210, referencia: true },
      { tipoPrecio: 'DISTRIBUIDOR', minPiezas: 12, precio: 190, referencia: false },
    ],
    precioReferencia: { tipoPrecio: 'MAYOREO', precio: 210, minPiezas: 6 },
    cantidadInicial: 1, existenciaTotal: 18, disponible: true,
    ...extra,
  }
}

export function gatewayFalso(): ICatalogoGateway & { [K in keyof ICatalogoGateway]: ReturnType<typeof vi.fn> } {
  return {
    consultarLinea: vi.fn().mockResolvedValue(paginaCaps()),
    buscar: vi.fn().mockResolvedValue(paginaCaps({ linea: null, lineas: [{ id: 1, nombre: 'CAPS', ruta: 'caps', cantidad: 2 }] })),
    obtenerProducto: vi.fn().mockResolvedValue(detalleDodgers()),
  }
}

export function carritoFalso(): ICarritoCatalogo & { agregar: ReturnType<typeof vi.fn> } {
  return { agregar: vi.fn().mockResolvedValue(undefined) }
}

/** Pendiente en memoria (la implementación real usa localStorage). */
export function pendientesEnMemoria(inicial: AgregadoPendienteTs | null = null): IAgregadoPendiente & { valor: AgregadoPendienteTs | null } {
  const almacen = {
    valor: inicial,
    guardar(p: AgregadoPendienteTs) { almacen.valor = p },
    obtener() { return almacen.valor },
    limpiar() { almacen.valor = null },
  }
  return almacen
}

/** Promesa que la prueba resuelve cuando quiere (respuestas desordenadas). */
export function diferida<T>() {
  let resolver!: (valor: T) => void
  const promesa = new Promise<T>((r) => { resolver = r })
  return { promesa, resolver }
}
