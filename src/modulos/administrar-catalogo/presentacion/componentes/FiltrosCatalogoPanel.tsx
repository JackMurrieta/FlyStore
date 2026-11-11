import { useState } from 'react'
import type { FiltrosCatalogoTs } from '../../dominio/FiltrosCatalogoTs'
import type { FiltrosDisponiblesTs } from '../../dominio/FiltrosDisponiblesTs'
import { EstadoProducto } from '../../dominio/EstadoProducto'
import { filtrosVacios } from '../hooks/useCatalogoAdmin'
import { Boton } from '@compartido/ui/Boton'
import { Icono } from '@compartido/ui/iconos/Icono'
import estilos from '../vistas/CatalogoAdmin.module.css'

interface Props {
  filtrosDisponibles: FiltrosDisponiblesTs | null
  cargando: boolean
  alBuscar: (filtros: FiltrosCatalogoTs) => Promise<void>
}

export function FiltrosCatalogoPanel({ filtrosDisponibles, cargando, alBuscar }: Props) {
  const [filtros, setFiltros] = useState(filtrosVacios)
  const activos = Object.values(filtros).filter(Boolean).length
  return <form className={estilos.filtros} onSubmit={e => { e.preventDefault(); void alBuscar(filtros) }}>
    <fieldset disabled={cargando} className={estilos.filaFiltros}>
      <legend className={estilos.soloLectores}>Buscar y filtrar catálogo</legend>
      <label className={estilos.buscadorCatalogo}><Icono nombre="search" tamano={18} />
        <span className={estilos.soloLectores}>Buscar producto</span><input type="search" placeholder="Buscar por nombre, SKU o marca"
          value={filtros.texto} onChange={e => setFiltros({ ...filtros, texto: e.target.value })} /></label>
      {(['idCategoria', 'idSubcategoria', 'idMarca'] as const).map((campo, indice) => {
        const grupo = (['categorias', 'subcategorias', 'marcas'] as const)[indice]!
        return <label key={campo} className={estilos.filtroSelect}>
          <span>{(['Categoría', 'Tipo', 'Marca'] as const)[indice]}:</span>
          <select value={filtros[campo]} aria-label={(['Categoría', 'Subcategoría', 'Marca'] as const)[indice]}
            onChange={e => setFiltros({ ...filtros, [campo]: e.target.value, ...(campo === 'idCategoria' ? { idSubcategoria: '' } : {}) })}>
            <option value="">Todas</option>
            {filtrosDisponibles?.[grupo].map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
        </label>
      })}
      <label className={estilos.filtroSelect}><span>Estado:</span>
        <select value={filtros.estado ?? ''} aria-label="Estado" onChange={e => setFiltros({ ...filtros,
          estado: Object.values(EstadoProducto).find(valor => valor === e.target.value) ?? null })}>
          <option value="">Todos</option>{Object.values(EstadoProducto).map(estado => <option key={estado} value={estado}>
            {estado === 'PUBLICADO' ? 'Publicado' : estado === 'BORRADOR' ? 'Borrador' : 'Inactivo'}</option>)}
        </select>
      </label>
      <Boton type="submit" variante="secundario">Buscar</Boton>
    </fieldset>
    <div className={estilos.ayudaFiltros}><p><Icono nombre="info" tamano={16} />Filtra el catálogo por categoría, tipo de producto, marca o estado.</p>
      <button type="button" disabled={cargando} onClick={() => { setFiltros(filtrosVacios); void alBuscar(filtrosVacios) }}>{activos} filtros activos · Limpiar</button>
    </div>
  </form>
}