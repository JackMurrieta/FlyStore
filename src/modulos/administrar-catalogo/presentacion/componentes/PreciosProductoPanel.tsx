import type { PrecioProductoTs } from '../../dominio/PrecioProductoTs'
import { TipoPrecio } from '../../dominio/TipoPrecio'
import { Campo } from '@compartido/ui/Campo'
import estilos from '../vistas/CatalogoAdmin.module.css'
import f from '../vistas/FormularioProducto.module.css'

interface Props {
  precios: PrecioProductoTs[]
  alCambiar: (precios: PrecioProductoTs[]) => void
  error?: string
  bloqueado?: boolean
}

/** Los cinco esquemas del backend; solo Base es obligatorio. Los mínimos sugeridos son los de la tienda. */
const ESQUEMAS_PRECIO = [
  { tipoPrecio: TipoPrecio.BASE, nombre: 'Base', minimo: 1 },
  { tipoPrecio: TipoPrecio.EMPRENDEDOR, nombre: 'Emprendedor', minimo: 3 },
  { tipoPrecio: TipoPrecio.MAYOREO, nombre: 'Mayoreo', minimo: 6 },
  { tipoPrecio: TipoPrecio.DISTRIBUIDOR, nombre: 'Distribuidor', minimo: 12 },
  { tipoPrecio: TipoPrecio.SOCIO_COMERCIAL, nombre: 'Socio comercial', minimo: 24 },
] as const

export function PreciosProductoPanel({ precios, alCambiar, error, bloqueado = false }: Props) {
  const capturarPrecio = (tipoPrecio: TipoPrecio, precio: number, minPiezas: number) => {
    alCambiar([...precios.filter(item => item.tipoPrecio !== tipoPrecio), { tipoPrecio, precio, minPiezas }])
  }
  return <div className={estilos.grupoCampo}>
    <div className={f.precios}>{ESQUEMAS_PRECIO.map(esquema => {
      const actual = precios.find(precio => precio.tipoPrecio === esquema.tipoPrecio)
      const base = esquema.tipoPrecio === TipoPrecio.BASE
      return <div key={esquema.tipoPrecio} className={estilos.esquemaPrecio}>
        <Campo etiqueta={`${esquema.nombre}${base ? ' *' : ''} · MXN`}
          type="number" inputMode="decimal" min="0.01" step="0.01" placeholder={base ? '$0.00' : 'Opcional'} disabled={bloqueado}
          value={actual && Number.isFinite(actual.precio) ? actual.precio : ''}
          onChange={e => {
            if (!e.target.value) alCambiar(precios.filter(precio => precio.tipoPrecio !== esquema.tipoPrecio))
            else capturarPrecio(esquema.tipoPrecio, Number(e.target.value), base ? 1 : actual?.minPiezas ?? esquema.minimo)
          }} />
        <Campo etiqueta={`Desde (piezas) · ${esquema.nombre}`} type="number" min="1" step="1"
          value={actual && Number.isFinite(actual.minPiezas) ? actual.minPiezas : actual ? '' : esquema.minimo}
          disabled={bloqueado || !actual || base}
          ayuda={base ? 'Base aplica desde 1 pieza' : undefined}
          onChange={e => capturarPrecio(esquema.tipoPrecio, actual!.precio, e.target.value === '' ? NaN : Number(e.target.value))} />
      </div>
    })}</div>
    {error && <p className={estilos.errorCampo} role="alert">{error}</p>}
  </div>
}
