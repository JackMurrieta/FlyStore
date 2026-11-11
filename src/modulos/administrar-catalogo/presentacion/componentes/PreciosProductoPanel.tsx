import type { PrecioProductoTs } from '../../dominio/PrecioProductoTs'
import { TipoPrecio } from '../../dominio/TipoPrecio'
import { Campo } from '@compartido/ui/Campo'
import estilos from '../vistas/CatalogoAdmin.module.css'

interface Props {
  precios: PrecioProductoTs[]
  alCambiar: (precios: PrecioProductoTs[]) => void
  error?: string
}
const esquemas = [
  { tipoPrecio: TipoPrecio.BASE, nombre: 'Base', minimo: 1 },
  { tipoPrecio: TipoPrecio.MAYOREO, nombre: 'Mayoreo', minimo: 6 },
  { tipoPrecio: TipoPrecio.DISTRIBUIDOR, nombre: 'Distribuidor', minimo: 12 },
]

export function PreciosProductoPanel({ precios, alCambiar, error }: Props) {
  const capturarPrecio = (tipoPrecio: TipoPrecio, precio: number, minPiezas: number) => {
    alCambiar([...precios.filter(item => item.tipoPrecio !== tipoPrecio), { tipoPrecio, precio, minPiezas }])
  }
  return <div>
    <div className={estilos.tresColumnas}>{esquemas.map(esquema => {
      const actual = precios.find(precio => precio.tipoPrecio === esquema.tipoPrecio)
      return <div key={esquema.tipoPrecio} className={estilos.esquemaPrecio}>
        <Campo etiqueta={`${esquema.nombre}${esquema.tipoPrecio === TipoPrecio.BASE ? ' *' : ''}`}
          type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="$0.00"
          value={actual && Number.isFinite(actual.precio) ? actual.precio : ''}
          onChange={e => {
            if (!e.target.value) alCambiar(precios.filter(precio => precio.tipoPrecio !== esquema.tipoPrecio))
            else capturarPrecio(esquema.tipoPrecio, Number(e.target.value), actual?.minPiezas ?? esquema.minimo)
          }} />
        <Campo etiqueta={`Mínimo de piezas · ${esquema.nombre}`} type="number" min="1" step="1"
          value={actual && Number.isFinite(actual.minPiezas) ? actual.minPiezas : actual ? '' : esquema.minimo}
          disabled={!actual} onChange={e => capturarPrecio(esquema.tipoPrecio, actual!.precio, e.target.value === '' ? NaN : Number(e.target.value))} />
      </div>
    })}</div>
    {error && <p className={estilos.errorCampo} role="alert">{error}</p>}
  </div>
}