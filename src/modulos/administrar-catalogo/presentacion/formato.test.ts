import { describe, expect, it } from 'vitest'
import { formatearPrecios } from './formato'
import { TipoPrecio } from '../dominio/TipoPrecio'
describe('Columnas de precios del catálogo administrativo', () => {
  it('mantiene Base / Mayoreo / Distribuidor aunque existan otros esquemas', () => {
    const precios = Object.values(TipoPrecio).map((tipoPrecio, i) => ({ tipoPrecio, precio: 100 + i, minPiezas: 1 }))
    const resultado = formatearPrecios(precios).split(' / ')
    expect(resultado).toHaveLength(3)
    expect(resultado[0]).toContain('100.00')
    expect(resultado[1]).toContain('102.00')
    expect(resultado[2]).toContain('103.00')
  })
})
