import { useId, useState } from 'react'
import type { TallaTs } from '../../dominio/TallaTs'
import type { VarianteProductoTs } from '../../dominio/VarianteProductoTs'
import { Campo } from '@compartido/ui/Campo'
import { Boton } from '@compartido/ui/Boton'
import { Icono } from '@compartido/ui/iconos/Icono'
import estilos from '../vistas/CatalogoAdmin.module.css'

interface Props {
  tallas: TallaTs[]
  categoriaSeleccionada: boolean
  cargandoTallas: boolean
  errorTallas: string | null
  alAgregar: (variante: VarianteProductoTs) => boolean
}
export function VarianteProductoPanel({ tallas, categoriaSeleccionada, cargandoTallas, errorTallas, alAgregar }: Props) {
  const ayudaId = useId()
  const [talla, setTalla] = useState('')
  const [color, setColor] = useState('')
  const [stock, setStock] = useState('0')
  const ayuda = !categoriaSeleccionada ? 'Primero selecciona la categoría del producto en la sección 1, «Categorías y marca».'
    : cargandoTallas ? 'Cargando las tallas de la categoría…'
      : errorTallas ? `No se pudieron cargar las tallas: ${errorTallas}`
        : !tallas.length ? 'La categoría seleccionada no tiene tallas disponibles.' : null
  return <div className={estilos.editorVariante}>
    <div className={estilos.tresColumnas}>
      <Campo etiqueta="Color predominante *" placeholder="Ej. Negro" value={color} onChange={e => setColor(e.target.value)} />
      <label className={estilos.campoSelect}>Talla *
        <select value={talla} onChange={e => setTalla(e.target.value)} disabled={!tallas.length || cargandoTallas || !!errorTallas}
          aria-busy={cargandoTallas} aria-describedby={ayuda ? ayudaId : undefined}>
          <option value="">{!categoriaSeleccionada ? 'Elige una categoría' : cargandoTallas ? 'Cargando tallas…'
            : errorTallas ? 'Error al cargar tallas' : !tallas.length ? 'Sin tallas disponibles' : 'Selecciona una talla'}</option>
          {tallas.map(item => <option key={item.idTalla} value={item.nombre}>{item.nombre}</option>)}
        </select>
      </label>
      <Campo etiqueta="Existencia *" type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} />
    </div>
    {ayuda && <p id={ayudaId} role={errorTallas ? 'alert' : 'status'}>{ayuda}
      {!categoriaSeleccionada && <> <a href="#categorias-producto">Ir a categorías</a></>}
    </p>}
    <Boton variante="secundario" disabled={!categoriaSeleccionada || cargandoTallas || !!errorTallas || !tallas.length}
      icono={<Icono nombre="plus" tamano={16} />} onClick={() => {
      if (alAgregar({ talla, color, stock: stock === '' ? NaN : Number(stock) })) { setColor(''); setStock('0') }
    }}>Agregar variante</Boton>
  </div>
}
