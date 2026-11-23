import { describe, expect, it } from 'vitest'
import { migasDe, seccionDe, seccionesPara } from './secciones'

describe('Secciones del panel «Administrar tienda»', () => {
  it('Empleados y Configuración son solo del administrador; el cliente no ve nada', () => {
    const empleado = seccionesPara('EMPLEADO').map(s => s.clave)
    expect(empleado).toEqual(['inicio', 'pedidos', 'catalogo', 'inventario', 'codigos', 'clientes', 'reportes'])
    expect(seccionesPara('ADMIN').map(s => s.clave)).toEqual(expect.arrayContaining(['empleados', 'configuracion']))
    expect(seccionesPara('CLIENTE')).toEqual([])
    expect(seccionesPara(null)).toEqual([])
  })

  it('reconoce la sección de una subpágina por el prefijo más largo', () => {
    expect(seccionDe('/admin')?.clave).toBe('inicio')
    expect(seccionDe('/admin/catalogo/42/editar')?.clave).toBe('catalogo')
    expect(seccionDe('/admin/codigos-descuento/')?.clave).toBe('codigos')
    expect(seccionDe('/perfil')).toBeUndefined()
  })

  it('arma las migas con la subpágina al final', () => {
    expect(migasDe('/admin/catalogo')).toEqual([{ etiqueta: 'Panel', ruta: '/admin' }, { etiqueta: 'Catálogo' }])
    expect(migasDe('/admin/catalogo/nuevo').map(m => m.etiqueta)).toEqual(['Panel', 'Catálogo', 'Nuevo producto'])
    expect(migasDe('/admin/catalogo/42/editar')[1]).toEqual({ etiqueta: 'Catálogo', ruta: '/admin/catalogo' })
    expect(migasDe('/admin/catalogo/42/editar').at(-1)?.etiqueta).toBe('Editar producto')
    expect(migasDe('/admin/pedidos/FLY-000128').at(-1)?.etiqueta).toBe('Pedido FLY-000128')
  })
})
