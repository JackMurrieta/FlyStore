import { describe, expect, it } from 'vitest'
import {
  CRITERIOS_VACIOS, alternar, claveConsulta, coloresDeVariantes, criteriosAParametros, criteriosDesdeParametros,
  hayFiltros, imagenesDeColor, limitarCantidad, limpiarFiltros, nivelPorCantidad, siguienteNivel,
  validarRangoPrecio, validarTextoBusqueda, varianteInicial,
} from './ReglasCatalogo'
import type { NivelPrecioTs, VarianteVentaTs } from './DetalleProductoTs'

const niveles: NivelPrecioTs[] = [
  { tipoPrecio: 'BASE', etiqueta: 'Base', minPiezas: 1, precio: 250, referencia: false },
  { tipoPrecio: 'MAYOREO', etiqueta: 'Mayoreo', minPiezas: 6, precio: 210, referencia: true },
  { tipoPrecio: 'DISTRIBUIDOR', etiqueta: 'Distribuidor', minPiezas: 12, precio: 190, referencia: false },
]

const variante = (id: number, idColor: number | null, existencia: number): VarianteVentaTs => ({
  id, sku: `S${id}`, idColor, color: idColor === 1 ? 'Negro' : 'Azul', hex: null, idTalla: null, talla: null,
  tipoTalla: null, unidadMedida: null, existencia, disponible: existencia > 0,
})

describe('ReglasCatalogo · criterios en la URL', () => {
  it('ida y vuelta: solo escribe lo que filtra y el orden distinto al de por defecto', () => {
    const criterios = { ...CRITERIOS_VACIOS, texto: ' 9forty ', marcas: [1, 2], colores: [3], precioMin: 100, orden: 'PRECIO_ASC' as const }
    const parametros = criteriosAParametros(criterios)
    expect(parametros.toString()).toBe('texto=9forty&marca=1%2C2&color=3&precioMin=100&orden=PRECIO_ASC')
    expect(criteriosDesdeParametros(parametros)).toEqual({ ...criterios, texto: '9forty' })
    expect(criteriosAParametros(CRITERIOS_VACIOS).toString()).toBe('')
  })

  it('un enlace viejo o mal formado no rompe la página', () => {
    const criterios = criteriosDesdeParametros(new URLSearchParams('marca=1,x,-2,1&precioMin=abc&orden=otro&unidadMedida=ml,,ml'))
    expect(criterios.marcas).toEqual([1])
    expect(criterios.precioMin).toBeNull()
    expect(criterios.orden).toBe('RECIENTES')
    expect(criterios.unidadesMedida).toEqual(['ml'])
  })

  it('la clave de consulta distingue destino y criterios', () => {
    expect(claveConsulta('linea:caps', CRITERIOS_VACIOS)).not.toBe(claveConsulta('linea:shoes', CRITERIOS_VACIOS))
    expect(claveConsulta('linea:caps', { ...CRITERIOS_VACIOS, marcas: [1] })).toBe('linea:caps?marca=1')
  })

  it('alternar, hayFiltros y limpiarFiltros (conserva búsqueda y orden)', () => {
    expect(alternar([1, 2], 2)).toEqual([1])
    expect(alternar([1], 3)).toEqual([1, 3])
    const criterios = { ...CRITERIOS_VACIOS, texto: 'gorra', orden: 'NOMBRE_ASC' as const, tallas: [4] }
    expect(hayFiltros(criterios)).toBe(true)
    expect(limpiarFiltros(criterios)).toEqual({ ...CRITERIOS_VACIOS, texto: 'gorra', orden: 'NOMBRE_ASC' })
    expect(hayFiltros({ ...CRITERIOS_VACIOS, texto: 'gorra' })).toBe(false)
  })

  it('A1 · búsqueda en blanco y rango de precio inválido', () => {
    expect(validarTextoBusqueda('   ')).toMatch(/Escribe/)
    expect(validarTextoBusqueda('new era')).toBeNull()
    expect(validarRangoPrecio(300, 100)).toMatch(/mayor/)
    expect(validarRangoPrecio(-1, null)).toMatch(/negativo/)
    expect(validarRangoPrecio(100, 300)).toBeNull()
  })
})

describe('ReglasCatalogo · ficha', () => {
  it('el esquema cambia con las piezas (precio por cantidad)', () => {
    expect(nivelPorCantidad(niveles, 1)?.tipoPrecio).toBe('BASE')
    expect(nivelPorCantidad(niveles, 6)?.tipoPrecio).toBe('MAYOREO')
    expect(nivelPorCantidad(niveles, 40)?.tipoPrecio).toBe('DISTRIBUIDOR')
    expect(nivelPorCantidad([niveles[1]!], 2)?.tipoPrecio).toBe('MAYOREO')
    expect(nivelPorCantidad([], 2)).toBeNull()
    expect(siguienteNivel(niveles, 3)?.tipoPrecio).toBe('MAYOREO')
    expect(siguienteNivel(niveles, 12)).toBeNull()
  })

  it('variante inicial: el color de la tarjeta si tiene existencia; si no, la primera disponible', () => {
    const variantes = [variante(1, 1, 0), variante(2, 2, 5), variante(3, 1, 4)]
    expect(varianteInicial(variantes, 1)?.id).toBe(3)
    expect(varianteInicial(variantes, 9)?.id).toBe(2)
    expect(varianteInicial([variante(1, 1, 0)], null)?.id).toBe(1)
    expect(coloresDeVariantes(variantes).map(c => [c.idColor, c.disponible])).toEqual([[1, true], [2, true]])
  })

  it('galería del color y cantidad entre 1 y la existencia', () => {
    const imagenes = [{ url: 'a', idColor: 1, orden: 0 }, { url: 'b', idColor: null, orden: 1 }, { url: 'c', idColor: 2, orden: 2 }]
    expect(imagenesDeColor(imagenes, 1).map(i => i.url)).toEqual(['a', 'b'])
    expect(imagenesDeColor([{ url: 'c', idColor: 2, orden: 0 }], 1).map(i => i.url)).toEqual(['c'])
    expect(limitarCantidad(0, 10)).toBe(1)
    expect(limitarCantidad(15, 10)).toBe(10)
    expect(limitarCantidad(Number.NaN, 10)).toBe(1)
    expect(limitarCantidad(3.7, 10)).toBe(3)
  })
})
