import { Dialogo } from '@compartido/ui/Dialogo'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { ProductoCatalogoTs } from '../../dominio/ProductoCatalogoTs'
import { ProductoMiniatura } from './ProductoMiniatura'
import { EstadoProductoInsignia } from './EstadoProductoInsignia'
import estilos from '../vistas/CatalogoAdmin.module.css'

interface Props {
  producto: ProductoCatalogoTs | null
  confirmando: boolean
  error: string | null
  alConfirmar: () => void
  alCancelar: () => void
}

export function ConfirmarBajaPanel({ producto, confirmando, error, alConfirmar, alCancelar }: Props) {
  return <Dialogo abierto={producto !== null} titulo="¿Dar de baja este producto?" icono="archive"
    alineacion="izquierda" tonoIcono="peligro" alCerrar={alCancelar}>
    <div className={estilos.contenidoBaja}>
      <p>Dejará de mostrarse en la tienda. El sistema determinará si corresponde inactivarlo o eliminarlo según su historial.</p>
      {producto && <div className={estilos.resumenBaja}>
        <ProductoMiniatura key={producto.imagen} imagen={producto.imagen} nombre={producto.nombre} />
        <div><p>{producto.nombre}</p><small>{producto.clave} · {producto.existencias} pzas en existencia</small></div>
        <EstadoProductoInsignia estado={producto.estado} />
      </div>}
      {error && <Aviso tono="error">{error}</Aviso>}
      <div className={estilos.accionesBaja}>
        <Boton variante="secundario" disabled={confirmando} onClick={alCancelar}>Cancelar</Boton>
        <Boton variante="peligroSolido" icono={<Icono nombre="archive" tamano={16} />}
          cargando={confirmando} onClick={alConfirmar}>Dar de baja</Boton>
      </div>
    </div>
  </Dialogo>
}