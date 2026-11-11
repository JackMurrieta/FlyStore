import { useState } from 'react'
import { Icono } from '@compartido/ui/iconos/Icono'
import estilos from '../vistas/CatalogoAdmin.module.css'

export function ProductoMiniatura({ imagen, nombre }: { imagen: string; nombre: string }) {
  const [fallo, setFallo] = useState(false)
  return <span className={estilos.miniatura}>
    {imagen && !fallo ? <img src={imagen} alt={nombre} loading="lazy" onError={() => setFallo(true)} />
      : <Icono nombre="image" tamano={20} />}
  </span>
}
