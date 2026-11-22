/**
 * Reglas del catálogo de la tienda (CU-01). Funciones puras: las usan los modelos y los hooks.
 */

import type { OrdenCatalogoTs, TipoPrecioTs } from './CatalogoTs'
import type { CriteriosBusquedaTs } from './CriteriosBusquedaTs'
import type { ColorDetalleTs, ImagenProductoTs, NivelPrecioTs, VarianteVentaTs } from './DetalleProductoTs'

export const TAMANO_PAGINA = 30
export const MAX_TEXTO_BUSQUEDA = 100

export const ORDENES: readonly OrdenCatalogoTs[] = ['RECIENTES', 'PRECIO_ASC', 'PRECIO_DESC', 'NOMBRE_ASC', 'MAS_VENDIDOS']

export const CRITERIOS_VACIOS: CriteriosBusquedaTs = {
  texto: '',
  marcas: [],
  subcategorias: [],
  tallas: [],
  colores: [],
  unidadesMedida: [],
  precioMin: null,
  precioMax: null,
  orden: 'RECIENTES',
}

const ETIQUETAS_PRECIO: Record<TipoPrecioTs, string> = {
  BASE: 'Base',
  EMPRENDEDOR: 'Emprendedor',
  MAYOREO: 'Mayoreo',
  DISTRIBUIDOR: 'Distribuidor',
  SOCIO_COMERCIAL: 'Socio comercial',
}

export function etiquetaTipoPrecio(tipo: string): string {
  return ETIQUETAS_PRECIO[tipo as TipoPrecioTs] ?? tipo
}

export function esTipoPrecio(valor: string): valor is TipoPrecioTs {
  return valor in ETIQUETAS_PRECIO
}

// ─────────────────────────── Criterios ↔ URL ───────────────────────────

/** Nombre de cada criterio en la URL de la app y en la del backend (son los mismos). */
const PARAMETRO = {
  texto: 'texto',
  marcas: 'marca',
  subcategorias: 'subcategoria',
  tallas: 'talla',
  colores: 'color',
  unidadesMedida: 'unidadMedida',
  precioMin: 'precioMin',
  precioMax: 'precioMax',
  orden: 'orden',
} as const

function ids(valor: string | null): number[] {
  if (!valor) return []
  const unicos = new Set<number>()
  for (const parte of valor.split(',')) {
    const id = Number(parte.trim())
    if (Number.isInteger(id) && id > 0) unicos.add(id)
  }
  return [...unicos]
}

function precio(valor: string | null): number | null {
  if (valor === null || valor.trim() === '') return null
  const numero = Number(valor)
  return Number.isFinite(numero) && numero >= 0 ? numero : null
}

/** Lee los criterios de la URL ignorando valores mal formados (un enlace viejo no rompe la página). */
export function criteriosDesdeParametros(parametros: URLSearchParams): CriteriosBusquedaTs {
  const orden = (parametros.get(PARAMETRO.orden) ?? '').toUpperCase()
  const unidades = (parametros.get(PARAMETRO.unidadesMedida) ?? '')
    .split(',').map(u => u.trim()).filter(Boolean)
  return {
    texto: (parametros.get(PARAMETRO.texto) ?? '').slice(0, MAX_TEXTO_BUSQUEDA),
    marcas: ids(parametros.get(PARAMETRO.marcas)),
    subcategorias: ids(parametros.get(PARAMETRO.subcategorias)),
    tallas: ids(parametros.get(PARAMETRO.tallas)),
    colores: ids(parametros.get(PARAMETRO.colores)),
    unidadesMedida: [...new Set(unidades)],
    precioMin: precio(parametros.get(PARAMETRO.precioMin)),
    precioMax: precio(parametros.get(PARAMETRO.precioMax)),
    orden: (ORDENES as readonly string[]).includes(orden) ? (orden as OrdenCatalogoTs) : 'RECIENTES',
  }
}

/** Criterios → parámetros. Solo escribe lo que filtra; el orden por defecto no se escribe. */
export function criteriosAParametros(criterios: CriteriosBusquedaTs): URLSearchParams {
  const parametros = new URLSearchParams()
  const texto = criterios.texto.trim()
  if (texto) parametros.set(PARAMETRO.texto, texto)
  const listas: [keyof typeof PARAMETRO, readonly (number | string)[]][] = [
    ['marcas', criterios.marcas],
    ['subcategorias', criterios.subcategorias],
    ['tallas', criterios.tallas],
    ['colores', criterios.colores],
    ['unidadesMedida', criterios.unidadesMedida],
  ]
  for (const [clave, valores] of listas) {
    if (valores.length > 0) parametros.set(PARAMETRO[clave], valores.join(','))
  }
  if (criterios.precioMin !== null) parametros.set(PARAMETRO.precioMin, String(criterios.precioMin))
  if (criterios.precioMax !== null) parametros.set(PARAMETRO.precioMax, String(criterios.precioMax))
  if (criterios.orden !== 'RECIENTES') parametros.set(PARAMETRO.orden, criterios.orden)
  return parametros
}

/** Identifica una consulta (destino + criterios) para no volver a pedirla al regresar del detalle. */
export function claveConsulta(destino: string, criterios: CriteriosBusquedaTs): string {
  return `${destino}?${criteriosAParametros(criterios).toString()}`
}

/** Agrega el valor si no está; lo quita si ya estaba (casillas y chips de filtros). */
export function alternar<T>(lista: readonly T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter(v => v !== valor) : [...lista, valor]
}

/** ¿Hay filtros elegidos? (sin contar la búsqueda ni el orden). */
export function hayFiltros(criterios: CriteriosBusquedaTs): boolean {
  return criterios.marcas.length > 0 || criterios.subcategorias.length > 0 || criterios.tallas.length > 0
    || criterios.colores.length > 0 || criterios.unidadesMedida.length > 0
    || criterios.precioMin !== null || criterios.precioMax !== null
}

/** Quita todos los filtros; conserva la búsqueda y el orden («Limpiar filtros»). */
export function limpiarFiltros(criterios: CriteriosBusquedaTs): CriteriosBusquedaTs {
  return { ...CRITERIOS_VACIOS, texto: criterios.texto, orden: criterios.orden }
}

/** A1 · La búsqueda en blanco no se ejecuta. Devuelve el mensaje o null si es válida. */
export function validarTextoBusqueda(texto: string): string | null {
  const limpio = texto.trim()
  if (!limpio) return 'Escribe un nombre, modelo o marca para buscar.'
  if (limpio.length > MAX_TEXTO_BUSQUEDA) return `La búsqueda admite hasta ${MAX_TEXTO_BUSQUEDA} caracteres.`
  return null
}

/** Rango de precio del filtro. Devuelve el mensaje o null si es válido. */
export function validarRangoPrecio(minimo: number | null, maximo: number | null): string | null {
  if ((minimo !== null && minimo < 0) || (maximo !== null && maximo < 0)) return 'El precio no puede ser negativo.'
  if (minimo !== null && maximo !== null && minimo > maximo) return 'El mínimo no puede ser mayor que el máximo.'
  return null
}

// ─────────────────────────── Ficha del producto ───────────────────────────

/**
 * Esquema que aplica a una cantidad: el de mayor mínimo de piezas que no la supere; si ninguno, el de
 * menos piezas. Es la misma regla del carrito, que suma las piezas del producto en todo el pedido.
 */
export function nivelPorCantidad(niveles: readonly NivelPrecioTs[], cantidad: number): NivelPrecioTs | null {
  if (niveles.length === 0) return null
  const alcanzados = niveles.filter(n => n.minPiezas <= cantidad)
  if (alcanzados.length === 0) return [...niveles].sort((a, b) => a.minPiezas - b.minPiezas)[0] ?? null
  return alcanzados.reduce((mejor, n) =>
    n.minPiezas > mejor.minPiezas || (n.minPiezas === mejor.minPiezas && n.precio < mejor.precio) ? n : mejor)
}

/** Siguiente esquema con más piezas («Agrega 4 piezas más para precio Mayoreo»). */
export function siguienteNivel(niveles: readonly NivelPrecioTs[], cantidad: number): NivelPrecioTs | null {
  return [...niveles].filter(n => n.minPiezas > cantidad).sort((a, b) => a.minPiezas - b.minPiezas)[0] ?? null
}

/** Colores de la ficha en el orden de sus variantes, sin repetir. */
export function coloresDeVariantes(variantes: readonly VarianteVentaTs[]): ColorDetalleTs[] {
  const colores = new Map<string, ColorDetalleTs>()
  for (const v of variantes) {
    const clave = String(v.idColor ?? v.color)
    const actual = colores.get(clave)
    colores.set(clave, {
      idColor: v.idColor,
      nombre: v.color,
      hex: v.hex,
      disponible: (actual?.disponible ?? false) || v.disponible,
    })
  }
  return [...colores.values()]
}

export function variantesDeColor(variantes: readonly VarianteVentaTs[], idColor: number | null): VarianteVentaTs[] {
  return variantes.filter(v => v.idColor === idColor)
}

/**
 * Variante con la que abre la ficha: la primera con existencia del color pedido (el de la tarjeta);
 * si ese color no tiene, la primera con existencia; si ninguna, la primera.
 */
export function varianteInicial(variantes: readonly VarianteVentaTs[], idColorPreferido: number | null): VarianteVentaTs | null {
  return variantes.find(v => v.idColor === idColorPreferido && v.disponible)
    ?? variantes.find(v => v.disponible)
    ?? variantes[0]
    ?? null
}

/** Galería de un color: sus fotos y las generales; si el color no tiene fotos, todas. */
export function imagenesDeColor(imagenes: readonly ImagenProductoTs[], idColor: number | null): ImagenProductoTs[] {
  const delColor = imagenes.filter(i => i.idColor === idColor)
  const generales = imagenes.filter(i => i.idColor === null)
  const galeria = [...delColor, ...generales]
  return galeria.length > 0 ? galeria : [...imagenes]
}

/** Cantidad válida para una variante: entre 1 y su existencia. */
export function limitarCantidad(cantidad: number, existencia: number): number {
  const entera = Number.isFinite(cantidad) ? Math.floor(cantidad) : 1
  return Math.max(1, Math.min(entera, Math.max(existencia, 1)))
}
