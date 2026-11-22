/** Formatos del catálogo en español de México. Solo presentación. */

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** 210 → «$210»; 189.5 → «$189.5» */
export const formatearPrecio = (valor: number): string => moneda.format(valor)

export const productos = (n: number): string => `${n.toLocaleString('es-MX')} ${n === 1 ? 'producto' : 'productos'}`

export const piezas = (n: number): string => `${n.toLocaleString('es-MX')} ${n === 1 ? 'pieza' : 'piezas'}`

export const colores = (n: number): string => `${n} ${n === 1 ? 'color' : 'colores'}`

/** «CAPS » → «Caps»; para el texto corrido. Los títulos se muestran en mayúsculas por CSS. */
export const nombreLinea = (nombre: string): string => {
  const limpio = nombre.trim()
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase()
}
