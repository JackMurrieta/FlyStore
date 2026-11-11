import { Insignia } from '@compartido/ui/Insignia'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { EstadoProducto } from '../../dominio/EstadoProducto'
import estilos from '../vistas/CatalogoAdmin.module.css'

export function EstadoProductoInsignia({ estado }: { estado: EstadoProducto }) {
  const publicado = estado === 'PUBLICADO'
  return <span className={estilos.estadoProducto}><Insignia tono={publicado ? 'exito' : 'neutro'}>
    {publicado ? <Icono nombre="check-circle" tamano={12} /> : <span aria-hidden="true">•</span>}
    {publicado ? 'Publicado' : estado === 'BORRADOR' ? 'Borrador' : 'Inactivo'}
  </Insignia></span>
}
