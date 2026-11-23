/** Formatos de dinero, piezas y fechas en español de México. Solo presentación. */

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 })
const monedaExacta = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })

/** 4210 → «$4,210»; 189.5 → «$189.5» */
export const formatearMonto = (valor: number): string => moneda.format(valor)

/** 4210 → «$4,210.00 MXN» (monto exacto a transferir) */
export const formatearMontoExacto = (valor: number): string => `${monedaExacta.format(valor)} MXN`

/** 4210 → «$4,210 MXN» */
export const formatearTotal = (valor: number): string => `${moneda.format(valor)} MXN`

/** 690 → «−$690» (signo menos tipográfico) */
export const formatearDescuento = (valor: number): string => `−${moneda.format(Math.abs(valor))}`

export const piezas = (n: number, corto = false): string =>
  corto ? `${n} ${n === 1 ? 'pza' : 'pzas'}` : `${n} ${n === 1 ? 'pieza' : 'piezas'}`

export const productos = (n: number): string => `${n} ${n === 1 ? 'producto' : 'productos'}`

/** «Ahorro por Mayoreo»; con productos en esquemas distintos («Mixto»), «Ahorro por volumen». */
export const etiquetaAhorro = (etiquetaEsquema: string): string =>
  etiquetaEsquema === 'Mixto' ? 'Ahorro por volumen' : `Ahorro por ${etiquetaEsquema}`

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function hora(fecha: Date): string {
  const h = fecha.getHours()
  const m = String(fecha.getMinutes()).padStart(2, '0')
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`
}

/** «Domingo 25 de octubre · 12:37 p. m.» */
export function formatearFechaLimite(fecha: Date): string {
  const dia = DIAS[fecha.getDay()] ?? ''
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${fecha.getDate()} de ${MESES[fecha.getMonth()] ?? ''} · ${hora(fecha)}`
}

/** «23/oct/2026 · 6:41 p. m.» */
export function formatearFechaTicket(fecha: Date): string {
  const mes = (MESES[fecha.getMonth()] ?? '').slice(0, 3)
  return `${fecha.getDate()}/${mes}/${fecha.getFullYear()} · ${hora(fecha)}`
}

/** «23 oct 2026» (lista de «Mis pedidos») */
export function formatearFechaCorta(fecha: Date): string {
  return `${fecha.getDate()} ${(MESES[fecha.getMonth()] ?? '').slice(0, 3)} ${fecha.getFullYear()}`
}

/** Horas completas que faltan para la fecha límite. */
export function horasRestantes(fecha: Date, ahora: Date): number {
  return Math.max(0, Math.floor((fecha.getTime() - ahora.getTime()) / 3_600_000))
}

/** «6441234567» → «644 123 4567» */
export function formatearTelefono(valor: string): string {
  const d = valor.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : valor
}
