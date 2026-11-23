/**
 * Panel «Administrar tienda» (Figma: barra lateral admin + barra superior admin).
 * Layout de todas las rutas /admin/*: las pantallas de cada caso de uso se pintan en <Outlet />.
 * Solo personal (ADMIN y EMPLEADO); la ruta se protege con RutaProtegida en app/rutas.tsx.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSesion, type RolTs } from '@compartido/sesion'
import { Icono } from '@compartido/ui/iconos/Icono'
import { CargaContenido, Esqueleto, EsqueletoTexto } from '@compartido/ui/carga'
import { migasDe, seccionDe, seccionesPara, RUTA_PANEL } from './secciones'
import { PanelTiendaContext, type ModelosPanel } from './PanelTiendaContext'
import { useResumenTienda } from './hooks/useResumenTienda'
import estilos from './componentes/panel.module.css'

const ETIQUETA_ROL: Record<RolTs, string> = { ADMIN: 'Administrador', EMPLEADO: 'Empleado', CLIENTE: 'Cliente' }

export interface PanelTiendaProps {
  readonly modelos: ModelosPanel
}

export function PanelTienda({ modelos }: PanelTiendaProps) {
  const { usuario, cerrarSesion } = useSesion()
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const { resumen } = useResumenTienda(modelos.resumen)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [errorSalir, setErrorSalir] = useState<string | null>(null)
  const botonMenuRef = useRef<HTMLButtonElement>(null)
  const barraRef = useRef<HTMLElement>(null)

  const secciones = seccionesPara(usuario?.rol)
  const migas = migasDe(pathname)
  const actual = seccionDe(pathname)
  const pagos = resumen?.pagosPorConfirmar
  const fecha = useMemo(() => new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date()), [])

  // Cada pantalla del panel empieza arriba y con un título que dice dónde estás.
  useEffect(() => {
    const raiz = document.scrollingElement ?? document.documentElement
    raiz.scrollTop = 0
    document.title = `${migas.at(-1)?.etiqueta ?? 'Panel'} · Panel FLY`
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Menú en celular: Esc lo cierra y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!menuAbierto) return
    barraRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return
      setMenuAbierto(false)
      botonMenuRef.current?.focus()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [menuAbierto])

  const cerrarMenu = () => setMenuAbierto(false)
  const salir = async () => {
    try {
      await cerrarSesion()
      modelos.resumen.reiniciar()
      navegar('/', { replace: true })
    } catch (e) {
      setErrorSalir(e instanceof Error ? e.message : 'No se pudo cerrar la sesión')
    }
  }

  return (
    <PanelTiendaContext.Provider value={modelos}>
      <div className={estilos.panel}>
        <a href="#contenido-panel" className={estilos.saltar}>Saltar al contenido</a>

        <aside ref={barraRef} id="navegacion-panel" className={`${estilos.barraLateral} ${menuAbierto ? estilos.abierta : ''}`}
          aria-label="Administrar tienda">
          <Link to={RUTA_PANEL} className={estilos.marca} onClick={cerrarMenu}>
            <img src="/flyBlanco.svg" alt="FLY" width="56" height="28" />
            <span>Panel</span>
          </Link>

          <nav aria-label="Secciones del panel">
            <ul className={estilos.secciones}>
              {secciones.map((s) => (
                <li key={s.clave}>
                  <NavLink to={s.ruta} end={s.ruta === RUTA_PANEL} onClick={cerrarMenu}
                    className={({ isActive }) => `${estilos.seccion} ${isActive || actual?.clave === s.clave ? estilos.activa : ''} ${s.disponible ? '' : estilos.pronto}`}>
                    <Icono nombre={s.icono} tamano={20} />
                    <span>{s.etiqueta}</span>
                    {s.clave === 'pedidos' && pagos && pagos.cantidad > 0 && <>
                      <span className={estilos.contador} aria-hidden="true">{pagos.cantidad}</span>
                      <span className={estilos.soloLectores}>, {pagos.cantidad} {pagos.cantidad === 1 ? 'pago' : 'pagos'} por confirmar</span>
                    </>}
                    {!s.disponible && <span className={estilos.etiquetaPronto}>Pronto</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={estilos.pieBarra}>
            <Link to="/" className={estilos.verTienda} onClick={cerrarMenu}>
              <Icono nombre="store" tamano={18} /> Ver la tienda
            </Link>
            {usuario && (
              <div className={estilos.usuario}>
                <span className={estilos.avatar} aria-hidden="true">{usuario.iniciales}</span>
                <div>
                  <p>{usuario.nombre}</p>
                  <small>{ETIQUETA_ROL[usuario.rol]}</small>
                </div>
                <button type="button" className={estilos.botonIcono} aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => void salir()}>
                  <Icono nombre="logout" tamano={18} />
                </button>
              </div>
            )}
            {errorSalir && <p className={estilos.error} role="alert">{errorSalir}</p>}
          </div>
        </aside>
        {menuAbierto && <button type="button" className={estilos.velo} aria-label="Cerrar menú" tabIndex={-1} onClick={cerrarMenu} />}

        <div className={estilos.area}>
          <header className={estilos.barraSuperior}>
            <button ref={botonMenuRef} type="button" className={`${estilos.botonIcono} ${estilos.botonMenu}`}
              aria-label="Abrir menú del panel" aria-expanded={menuAbierto} aria-controls="navegacion-panel"
              onClick={() => setMenuAbierto(true)}>
              <Icono nombre="menu" tamano={20} />
            </button>
            <nav aria-label="Ruta de navegación" className={estilos.migas}>
              <ol>
                {migas.map((miga, i) => (
                  <li key={`${miga.etiqueta}-${i}`}>
                    {miga.ruta ? <Link to={miga.ruta}>{miga.etiqueta}</Link> : <span aria-current="page">{miga.etiqueta}</span>}
                  </li>
                ))}
              </ol>
            </nav>
            <time className={estilos.fecha} dateTime={new Date().toLocaleDateString('en-CA')}>{fecha}</time>
          </header>
          <main id="contenido-panel" tabIndex={-1} className={estilos.contenido}>
            {/* La sección carga su código sin desmontar la barra lateral ni la superior. */}
            <Suspense fallback={<CargandoSeccion />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </PanelTiendaContext.Provider>
  )
}

/** Esqueleto del área de contenido mientras llega el código de una sección. */
function CargandoSeccion() {
  return (
    <CargaContenido texto="Cargando la sección…" className={estilos.pagina}>
      <Esqueleto forma="titulo" ancho="40%" />
      <EsqueletoTexto lineas={2} ultima="30%" />
      <Esqueleto alto={240} />
    </CargaContenido>
  )
}

export default PanelTienda
