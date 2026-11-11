import type { PrecioProductoTs } from '../dominio/PrecioProductoTs'
import { TipoPrecio } from '../dominio/TipoPrecio'

export const formatoMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 2,
})

export function formatearPrecios(precios: PrecioProductoTs[]) {
  return Object.values(TipoPrecio).map(tipo => {
    const precio = precios.find(item => item.tipoPrecio === tipo)
    return precio ? formatoMoneda.format(precio.precio) : '—'
  }).join(' / ')
}
