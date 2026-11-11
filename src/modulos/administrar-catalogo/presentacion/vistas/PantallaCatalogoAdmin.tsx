import { useState } from 'react'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import type { BajaProductoModel } from '../../aplicacion/BajaProductoModel'
import type { FiltrosCatalogoTs } from '../../dominio/FiltrosCatalogoTs'
import { useCatalogoAdmin } from '../hooks/useCatalogoAdmin'
import { useBajaProducto } from '../hooks/useBajaProducto'
import { FiltrosCatalogoPanel } from '../componentes/FiltrosCatalogoPanel'
import { ConfirmarBajaPanel } from '../componentes/ConfirmarBajaPanel'
import { EstadoProductoInsignia } from '../componentes/EstadoProductoInsignia'
import { ProductoMiniatura } from '../componentes/ProductoMiniatura'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import { TipoBaja } from '../../dominio/TipoBaja'
import { formatearPrecios } from '../formato'
import estilos from './CatalogoAdmin.module.css'

interface Props {
  catalogoModel: CatalogoModel
  bajaProductoModel: BajaProductoModel
  alAgregar: () => void
  mensaje?: string | null
  alCerrarMensaje?: () => void
}
const POR_PAGINA = 7

export function PantallaCatalogoAdmin({ catalogoModel, bajaProductoModel, alAgregar, mensaje, alCerrarMensaje }: Props) {
  const vm = useCatalogoAdmin(catalogoModel)
  const baja = useBajaProducto(bajaProductoModel)
  const [pestana, setPestana] = useState<'productos' | 'categorias'>('productos')
  const [pagina, setPagina] = useState(0)
  const [filtrosActuales, setFiltrosActuales] = useState<FiltrosCatalogoTs | undefined>()
  const ultimaPagina = Math.max(0, Math.ceil(vm.productos.length / POR_PAGINA) - 1)
  const paginaVisible = Math.min(pagina, ultimaPagina)
  const inicio = paginaVisible * POR_PAGINA
  const visibles = vm.productos.slice(inicio, inicio + POR_PAGINA)

  const buscar = async (filtros: FiltrosCatalogoTs) => {
    setFiltrosActuales(filtros); setPagina(0)
    await vm.buscarProductos(filtros)
  }

  return <main className={estilos.pantalla}>
    {mensaje && <div className={estilos.toast} role="status"><Icono nombre="check-circle" tamano={20} />
      <p>{mensaje}</p><button type="button" aria-label="Cerrar notificación" onClick={alCerrarMensaje}><Icono nombre="x" tamano={16} /></button>
    </div>}
    <header className={estilos.encabezadoPagina}>
      <div><p className={estilos.sobretitulo}>Administrar catálogo</p><h1>Catálogo</h1>
        <p className={estilos.textoSecundario}>{vm.productos.length} productos · {vm.filtrosDisponibles?.categorias.length ?? 0} categorías · {vm.filtrosDisponibles?.marcas.length ?? 0} marcas</p>
      </div>
      <Boton icono={<Icono nombre="plus" tamano={18} />} onClick={alAgregar}>Nuevo producto</Boton>
    </header>
    <div className={estilos.pestanas} role="tablist" aria-label="Catálogo">
      <button id="tab-productos" type="button" role="tab" aria-selected={pestana === 'productos'} aria-controls="panel-productos"
        tabIndex={pestana === 'productos' ? 0 : -1} onClick={() => setPestana('productos')}
        onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'End') { setPestana('categorias'); document.getElementById('tab-categorias')?.focus() } }}>Productos</button>
      <button id="tab-categorias" type="button" role="tab" aria-selected={pestana === 'categorias'} aria-controls="panel-categorias"
        tabIndex={pestana === 'categorias' ? 0 : -1} onClick={() => setPestana('categorias')}
        onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'Home') { setPestana('productos'); document.getElementById('tab-productos')?.focus() } }}>Categorías y marcas</button>
    </div>
    {vm.error && <Aviso tono="error" titulo="No se pudo cargar el catálogo">{vm.error}</Aviso>}
    {baja.resultado && <div role="status" className={estilos.mensajeExito}><Icono nombre="check-circle" tamano={18} />
      Producto {baja.resultado.tipoBaja === TipoBaja.ELIMINADO ? 'eliminado' : 'inactivado'} correctamente.</div>}
    <section id="panel-productos" role="tabpanel" aria-labelledby="tab-productos" hidden={pestana !== 'productos'}>
      <FiltrosCatalogoPanel filtrosDisponibles={vm.filtrosDisponibles} cargando={vm.cargando} alBuscar={buscar} />
      {vm.cargando ? <div role="status" className={estilos.estadoVacio}>Cargando catálogo…</div>
        : !vm.productos.length ? <div className={estilos.estadoVacio}><Icono nombre="search-x" tamano={28} />
          <h2>{vm.error ? 'Catálogo no disponible' : 'No encontramos productos'}</h2><p>Revisa los filtros o intenta consultar nuevamente.</p></div>
          : <>
            <div className={estilos.tabla} tabIndex={0} role="region" aria-label="Tabla de productos">
              <table><caption className={estilos.soloLectores}>Productos del catálogo</caption>
                <thead><tr>{['Producto', 'Categoría', 'Marca', 'Variantes', 'Existencia', 'Base / May. / Dist.', 'Estado', 'Acciones'].map(titulo =>
                  <th key={titulo} scope="col">{titulo === 'Acciones' ? <span className={estilos.soloLectores}>{titulo}</span> : titulo}</th>)}</tr></thead>
                <tbody>{visibles.map(producto => <tr key={producto.idProducto}>
                  <td><div className={estilos.productoCelda}><ProductoMiniatura key={producto.imagen} imagen={producto.imagen} nombre={producto.nombre} />
                    <div><p title={producto.nombre}>{producto.nombre}</p><small>{producto.clave}</small></div></div></td>
                  <td>{producto.categoria}</td><td>{producto.marca}</td><td>{producto.variantes.length}</td>
                  <td className={producto.existencias === 0 ? estilos.sinStock : undefined}>{producto.existencias} pzas</td>
                  <td className={estilos.preciosCelda}>{formatearPrecios(producto.precios)}</td>
                  <td><EstadoProductoInsignia estado={producto.estado} /></td>
                  <td><button type="button" className={estilos.botonIcono} aria-label={`Dar de baja ${producto.nombre}`} title="Dar de baja"
                    disabled={baja.confirmando || producto.estado === 'INACTIVO'} onClick={() => baja.solicitarBaja(producto)}><Icono nombre="archive" tamano={16} /></button></td>
                </tr>)}</tbody>
              </table>
            </div>
            <footer className={estilos.paginacion}><p aria-live="polite">Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, vm.productos.length)} de {vm.productos.length}</p>
              <div><button type="button" className={estilos.botonIcono} aria-label="Página anterior" disabled={paginaVisible === 0} onClick={() => setPagina(paginaVisible - 1)}><Icono nombre="chevron-left" tamano={16} /></button>
                <button type="button" className={estilos.botonIcono} aria-label="Página siguiente" disabled={paginaVisible >= ultimaPagina} onClick={() => setPagina(paginaVisible + 1)}><Icono nombre="chevron-right" tamano={16} /></button></div>
            </footer>
          </>}
    </section>
    <section id="panel-categorias" role="tabpanel" aria-labelledby="tab-categorias" hidden={pestana !== 'categorias'}>
      <div className={estilos.opcionesCatalogo}>{(['categorias', 'subcategorias', 'marcas'] as const).map(grupo => <section key={grupo} className={estilos.tarjeta}>
        <h2>{grupo === 'categorias' ? 'Categorías' : grupo === 'subcategorias' ? 'Subcategorías' : 'Marcas'}</h2>
        {vm.cargando ? <p>Cargando…</p> : <ul>{vm.filtrosDisponibles?.[grupo].map(item => <li key={item.id}>{item.nombre}</li>)}</ul>}
      </section>)}</div>
    </section>
    <ConfirmarBajaPanel producto={baja.producto} confirmando={baja.confirmando} error={baja.error}
      alCancelar={baja.cancelarBaja} alConfirmar={() => { void baja.confirmarBaja().then(ok => {
        if (ok) void (filtrosActuales ? vm.buscarProductos(filtrosActuales) : vm.obtenerCatalogo())
      }) }} />
  </main>
}