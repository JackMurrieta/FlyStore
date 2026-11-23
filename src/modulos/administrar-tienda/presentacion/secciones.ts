/**
 * Secciones del panel «Administrar tienda». Las que aún no tienen backend (`disponible: false`)
 * aparecen en la barra lateral con «Pronto» y abren una página que explica qué incluirán.
 */
import type { NombreIcono } from '@compartido/ui/iconos/Icono'
import type { RolTs } from '@compartido/sesion'

export const RUTA_PANEL = '/admin'

export type ClaveSeccion =
  | 'inicio' | 'pedidos' | 'catalogo' | 'inventario' | 'codigos'
  | 'clientes' | 'empleados' | 'reportes' | 'configuracion'

export interface SeccionPanel {
  readonly clave: ClaveSeccion
  readonly etiqueta: string
  readonly ruta: string
  readonly icono: NombreIcono
  readonly disponible: boolean
  readonly roles: readonly RolTs[]
  readonly descripcion: string
  /** Lo que tendrá la sección cuando exista (solo en las de «Pronto»). */
  readonly incluira?: readonly string[]
}

const PERSONAL: readonly RolTs[] = ['ADMIN', 'EMPLEADO']

export const SECCIONES_PANEL: readonly SeccionPanel[] = [
  { clave: 'inicio', etiqueta: 'Inicio', ruta: RUTA_PANEL, icono: 'grid', disponible: true, roles: PERSONAL,
    descripcion: 'Pendientes del día y accesos rápidos.' },
  { clave: 'pedidos', etiqueta: 'Pedidos', ruta: `${RUTA_PANEL}/pedidos`, icono: 'clipboard', disponible: true, roles: PERSONAL,
    descripcion: 'Pagos por validar, estados de envío y cancelaciones.' },
  { clave: 'catalogo', etiqueta: 'Catálogo', ruta: `${RUTA_PANEL}/catalogo`, icono: 'tag', disponible: true, roles: PERSONAL,
    descripcion: 'Productos, variantes, fotos por color y precios.' },
  { clave: 'inventario', etiqueta: 'Inventario', ruta: `${RUTA_PANEL}/inventario`, icono: 'package', disponible: false, roles: PERSONAL,
    descripcion: 'Existencias por variante en un solo lugar.',
    incluira: ['Existencias por color y talla', 'Entradas y ajustes de stock con motivo', 'Alertas de stock bajo'] },
  { clave: 'codigos', etiqueta: 'Códigos de descuento', ruta: `${RUTA_PANEL}/codigos-descuento`, icono: 'percent', disponible: false, roles: PERSONAL,
    descripcion: 'Códigos que el cliente canjea en el carrito.',
    incluira: ['Crear códigos para un producto', 'Porcentaje, vigencia y número de usos', 'Ver cuántas veces se usó cada código'] },
  { clave: 'clientes', etiqueta: 'Clientes', ruta: `${RUTA_PANEL}/clientes`, icono: 'users', disponible: false, roles: PERSONAL,
    descripcion: 'Quién compra y con qué tipo de precio.',
    incluira: ['Buscar por nombre, correo o teléfono', 'Tipo de cliente (Base, Mayoreo, Distribuidor…)', 'Historial de pedidos de cada cliente'] },
  { clave: 'empleados', etiqueta: 'Empleados', ruta: `${RUTA_PANEL}/empleados`, icono: 'briefcase', disponible: false, roles: ['ADMIN'],
    descripcion: 'Cuentas del personal de la tienda.',
    incluira: ['Dar de alta y de baja a empleados', 'Rol de cada cuenta', 'Último acceso'] },
  { clave: 'reportes', etiqueta: 'Reportes', ruta: `${RUTA_PANEL}/reportes`, icono: 'chart', disponible: false, roles: PERSONAL,
    descripcion: 'Tableros de ventas.',
    incluira: ['Ventas por día, semana y mes', 'Ventas por línea y por marca', 'Productos más vendidos'] },
  { clave: 'configuracion', etiqueta: 'Configuración', ruta: `${RUTA_PANEL}/configuracion`, icono: 'settings', disponible: false, roles: ['ADMIN'],
    descripcion: 'Datos generales de la tienda.',
    incluira: ['Datos de contacto y WhatsApp', 'Cuenta bancaria para transferencias', 'Costos de envío'] },
]

export function seccionesPara(rol: RolTs | null | undefined): SeccionPanel[] {
  return rol ? SECCIONES_PANEL.filter((s) => s.roles.includes(rol)) : []
}

export function seccionPorClave(clave: ClaveSeccion): SeccionPanel {
  return SECCIONES_PANEL.find((s) => s.clave === clave)!
}

/** Sección a la que pertenece la ruta (la de prefijo más largo). */
export function seccionDe(pathname: string): SeccionPanel | undefined {
  const ruta = pathname.replace(/\/+$/, '') || '/'
  return [...SECCIONES_PANEL]
    .sort((a, b) => b.ruta.length - a.ruta.length)
    .find((s) => ruta === s.ruta || ruta.startsWith(`${s.ruta}/`))
}

export interface MigaTs {
  readonly etiqueta: string
  /** Sin ruta: es la página actual. */
  readonly ruta?: string
}

/** «Panel / Catálogo / Editar producto». */
export function migasDe(pathname: string): MigaTs[] {
  const seccion = seccionDe(pathname)
  if (!seccion) return [{ etiqueta: 'Panel' }]
  const resto = pathname.replace(/\/+$/, '').slice(seccion.ruta.length).split('/').filter(Boolean)
  const subpagina = subpaginaDe(seccion.clave, resto)
  return [
    { etiqueta: 'Panel', ruta: RUTA_PANEL },
    subpagina ? { etiqueta: seccion.etiqueta, ruta: seccion.ruta } : { etiqueta: seccion.etiqueta },
    ...(subpagina ? [{ etiqueta: subpagina }] : []),
  ]
}

function subpaginaDe(clave: ClaveSeccion, resto: string[]): string | null {
  if (!resto.length) return null
  if (clave === 'catalogo' && resto[0] === 'nuevo') return 'Nuevo producto'
  if (clave === 'catalogo' && resto[1] === 'editar') return 'Editar producto'
  if (clave === 'pedidos') return `Pedido ${decodeURIComponent(resto[0]!)}`
  return null
}
