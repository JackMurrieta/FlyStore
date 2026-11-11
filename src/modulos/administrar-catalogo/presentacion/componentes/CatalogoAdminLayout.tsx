import { useState, type ReactNode } from 'react'
import { Icono, type NombreIcono } from '@compartido/ui/iconos/Icono'
import estilos from '../vistas/CatalogoAdmin.module.css'

export interface IdentidadAdmin {
  nombre: string
  rol: string
  iniciales: string
}

interface Props {
  children: ReactNode
  nuevoProducto: boolean
  usuario?: IdentidadAdmin
  alVerCatalogo: () => void
  alCerrarSesion?: () => void
}

const secciones: { nombre: string; icono: NombreIcono }[] = [
  { nombre: 'Dashboard', icono: 'grid' }, { nombre: 'Pedidos', icono: 'clipboard' },
  { nombre: 'Catálogo', icono: 'tag' }, { nombre: 'Inventario', icono: 'package' },
  { nombre: 'Clientes', icono: 'users' }, { nombre: 'Reportes', icono: 'chart' },
  { nombre: 'Configuración', icono: 'settings' },
]

export function CatalogoAdminLayout({ children, nuevoProducto, usuario, alVerCatalogo, alCerrarSesion }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const fecha = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
  return <div className={estilos.panelAdmin}>
    <a href="#contenido-catalogo" className={estilos.saltarContenido}>Saltar al contenido</a>
    <aside id="menu-catalogo" className={`${estilos.barraLateral} ${menuAbierto ? estilos.menuAbierto : ''}`}>
      <div className={estilos.marcaPanel}><img src="/admin/logo-fly.png" alt="FLY" width="64" height="36" /><span>Panel</span></div>
      <nav aria-label="Navegación del panel">{secciones.map(seccion => <button type="button" key={seccion.nombre}
        className={seccion.nombre === 'Catálogo' ? estilos.navActivo : estilos.navItem}
        aria-current={seccion.nombre === 'Catálogo' ? 'page' : undefined}
        disabled={seccion.nombre !== 'Catálogo' || nuevoProducto} title={seccion.nombre !== 'Catálogo' ? 'Sección aún no disponible' : undefined}
        onClick={() => { alVerCatalogo(); setMenuAbierto(false) }}>
        <Icono nombre={seccion.icono} tamano={20} /><span>{seccion.nombre}</span>
      </button>)}</nav>
      {usuario && <div className={estilos.usuarioPanel}><span className={estilos.avatar}>{usuario.iniciales}</span>
        <div><p>{usuario.nombre}</p><small>{usuario.rol}</small></div>
        {alCerrarSesion && <button type="button" aria-label="Cerrar sesión" onClick={alCerrarSesion}><Icono nombre="logout" tamano={18} /></button>}
      </div>}
    </aside>
    <div className={estilos.areaPrincipal}>
      <header className={estilos.barraSuperior}>
        <button type="button" className={estilos.menuMovil} aria-label="Mostrar navegación" aria-expanded={menuAbierto}
          aria-controls="menu-catalogo" onClick={() => setMenuAbierto(!menuAbierto)}><Icono nombre="menu" tamano={20} /></button>
        <p>Panel / Catálogo{nuevoProducto ? ' / Nuevo producto' : ''}</p>
        <div className={estilos.accionesSuperiores}>
          <span className={estilos.contextoPanel}><Icono nombre="tag" tamano={16} /> Administración de productos</span>
          <time dateTime={new Date().toLocaleDateString('en-CA')}>{fecha}</time>
        </div>
      </header>
      <div id="contenido-catalogo" tabIndex={-1}>{children}</div>
    </div>
  </div>
}
