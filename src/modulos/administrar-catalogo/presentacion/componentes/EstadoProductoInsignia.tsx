import { Insignia } from '@compartido/ui/Insignia'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { EstadoProducto } from '../../dominio/EstadoProducto'
import estilos from '../vistas/CatalogoAdmin.module.css'

export function EstadoProductoInsignia({ estado }: { estado: EstadoProducto }) {
  const publicado = estado === 'PUBLICADO'
  return <span className={estilos.estadoProducto}><Insignia tono={publicado ? 'exito' : estado === 'STOCK_BAJO' ? 'advertencia' : 'neutro'}>
    {publicado ? <Icono nombre="check-circle" tamano={12} /> : <span aria-hidden="true">•</span>}
    {publicado ? 'Publicado' : estado === 'BORRADOR' ? 'Borrador' : estado === 'STOCK_BAJO' ? 'Stock bajo' : 'Inactivo'}
  </Insignia></span>
}
