/**
 * Encabezado de la tienda (Figma «Encabezado tienda» 148:129), responsive.
 *
 * Escritorio (≥ 960 px): categorías · logo · buscador, carrito y menú de cuenta.
 * Móvil: ☰ · logo · carrito. El ☰ abre un panel lateral con buscador, categorías, cuenta y ayuda.
 *
 * Buenas prácticas aplicadas: el menú de cuenta es un botón «disclosure» (aria-expanded) con
 * enlaces normales; el panel lateral es un diálogo modal con trampa de foco, se cierra con Esc,
 * con el velo o al elegir una opción, bloquea el desplazamiento de la página y devuelve el foco
 * al botón que lo abrió. «Mis pedidos» y «Mi perfil» salen del menú de cuenta; «Administrar»
 * solo aparece para admin y empleado.
 */

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as EventoTeclado } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSesion } from '@compartido/sesion/SesionContext'
import type { RolTs, UsuarioSesionTs } from '@compartido/sesion/ISesion'
import { Texto } from '@compartido/ui/Texto'
import { Icono, type NombreIcono } from '@compartido/ui/iconos/Icono'
import { CATEGORIAS, RUTAS_AYUDA, RUTAS_CUENTA } from '@compartido/config/marca'
import styles from './Header.module.css'

interface EnlaceCuenta {
  readonly etiqueta: string
  readonly ruta: string
  readonly icono: NombreIcono
}

const ETIQUETA_ROL: Record<RolTs, string> = { CLIENTE: 'Cliente', ADMIN: 'Administrador', EMPLEADO: 'Empleado' }

/** Opciones de la cuenta según el rol. */
function enlacesDeCuenta(rol: RolTs | undefined): EnlaceCuenta[] {
  const enlaces: EnlaceCuenta[] = [{ etiqueta: 'Mi perfil', ruta: RUTAS_CUENTA.perfil, icono: 'user' }]
  if (rol === 'CLIENTE') enlaces.push({ etiqueta: 'Mis pedidos', ruta: RUTAS_CUENTA.misPedidos, icono: 'package' })
  if (rol === 'ADMIN' || rol === 'EMPLEADO') {
    enlaces.push(
      { etiqueta: 'Administrar catálogo', ruta: '/admin/catalogo', icono: 'grid' },
      { etiqueta: 'Administrar pedidos', ruta: '/admin/pedidos', icono: 'clipboard' }
    )
  }
  return enlaces
}

const primerNombre = (usuario: UsuarioSesionTs) => usuario.nombre.trim().split(/\s+/)[0] ?? usuario.nombre

export function Header() {
  const { estado, usuario, cerrarSesion } = useSesion()
  const navegar = useNavigate()
  const [panelAbierto, setPanelAbierto] = useState(false)
  const botonMenuRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const conSesion = estado === 'autenticado' && usuario ? usuario : null

  const salir = async () => {
    setPanelAbierto(false)
    await cerrarSesion()
    navegar('/')
  }

  const cerrarPanel = () => {
    setPanelAbierto(false)
    botonMenuRef.current?.focus()
  }

  return (
    <header className={styles.header}>
      <div className={styles.contenedor}>
        <button ref={botonMenuRef} type="button" className={`${styles.iconoBtn} ${styles.soloMovil}`}
          aria-label="Abrir menú" aria-expanded={panelAbierto} aria-controls={panelId} onClick={() => setPanelAbierto(true)}>
          <Icono nombre="menu" />
        </button>

        <nav className={`${styles.nav} ${styles.soloEscritorio}`} aria-label="Categorías">
          {CATEGORIAS.map((categoria) => (
            <NavLink key={categoria.ruta} to={categoria.ruta} className={styles.enlace}>
              {categoria.nombre}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className={styles.logo} aria-label="FlyStore, ir al inicio">
          <img src="/flyBlanco.svg" alt="" className={styles.logoImagen} />
        </Link>

        <div className={styles.acciones}>
          <Buscador className={styles.soloEscritorio} />
          <Link to={RUTAS_CUENTA.carrito} className={styles.iconoBtn} aria-label="Ver carrito">
            <Icono nombre="cart" />
          </Link>
          <div className={styles.soloEscritorio}>
            {conSesion ? (
              <MenuCuenta usuario={conSesion} alSalir={() => void salir()} />
            ) : estado === 'cargando' ? (
              <span className={styles.avatarCargando} aria-hidden="true" />
            ) : (
              <Link to={RUTAS_CUENTA.iniciarSesion} className={styles.botonEntrar}>Iniciar sesión</Link>
            )}
          </div>
        </div>
      </div>

      {panelAbierto && (
        <PanelNavegacion id={panelId} usuario={conSesion} alCerrar={cerrarPanel} alSalir={() => void salir()} />
      )}
    </header>
  )
}

/**
 * Buscador de la tienda. La búsqueda del catálogo (CU-01) aún no existe:
 * por ahora solo conserva el texto escrito.
 */
function Buscador({ className, alBuscar }: { readonly className?: string; readonly alBuscar?: () => void }) {
  const id = useId()
  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    alBuscar?.()
  }
  return (
    <form role="search" className={`${styles.buscador} ${className ?? ''}`.trim()} onSubmit={enviar}>
      <label htmlFor={id} className={styles.oculto}>Buscar productos</label>
      <Icono nombre="search" tamano={18} />
      <input id={id} type="search" placeholder="Buscar gorra, perfume, marca…" className={styles.campoBuscar} />
    </form>
  )
}

/** Botón de cuenta con menú desplegable (escritorio). */
function MenuCuenta({ usuario, alSalir }: { readonly usuario: UsuarioSesionTs; readonly alSalir: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!abierto) return
    const alPulsarFuera = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierto(false)
    }
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAbierto(false)
        botonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', alPulsarFuera)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  return (
    <div className={styles.cuenta} ref={contenedorRef}>
      <button ref={botonRef} type="button" className={styles.botonCuenta} aria-expanded={abierto} aria-controls={menuId}
        onClick={() => setAbierto((valor) => !valor)}>
        <span className={styles.avatar} aria-hidden="true">{usuario.iniciales}</span>
        <span className={styles.nombreCuenta}>{primerNombre(usuario)}</span>
        <span className={styles.oculto}>, abrir menú de tu cuenta</span>
        <Icono nombre="chevron-down" tamano={16} className={styles.flecha} />
      </button>
      {abierto && (
        <div id={menuId} className={styles.menuCuenta}>
          <div className={styles.encabezadoCuenta}>
            <Texto variante="etiqueta-fuerte">{usuario.nombre}</Texto>
            <Texto variante="mini" tono="secundario" className={styles.correo}>{usuario.correo}</Texto>
            <span className={styles.rol}>{ETIQUETA_ROL[usuario.rol] ?? usuario.rol}</span>
          </div>
          <ul className={styles.listaCuenta}>
            {enlacesDeCuenta(usuario.rol).map((enlace) => (
              <li key={enlace.ruta}>
                <Link to={enlace.ruta} className={styles.opcionCuenta} onClick={() => setAbierto(false)}>
                  <Icono nombre={enlace.icono} tamano={18} /> {enlace.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className={`${styles.opcionCuenta} ${styles.opcionSalir}`} onClick={alSalir}>
            <Icono nombre="logout" tamano={18} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

/** Panel lateral (móvil): diálogo modal con buscador, categorías, cuenta y ayuda. */
function PanelNavegacion({ id, usuario, alCerrar, alSalir }: {
  readonly id: string
  readonly usuario: UsuarioSesionTs | null
  readonly alCerrar: () => void
  readonly alSalir: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const botonCerrarRef = useRef<HTMLButtonElement>(null)
  const tituloId = useId()

  useEffect(() => {
    botonCerrarRef.current?.focus()
    const desbordeAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = desbordeAnterior
    }
  }, [])

  /** Trampa de foco y Esc. */
  const alTeclear = (evento: EventoTeclado<HTMLDivElement>) => {
    if (evento.key === 'Escape') {
      evento.stopPropagation()
      alCerrar()
      return
    }
    if (evento.key !== 'Tab' || !panelRef.current) return
    const enfocables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input')
    const primero = enfocables[0]
    const ultimo = enfocables[enfocables.length - 1]
    if (!primero || !ultimo) return
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero.focus()
    }
  }

  // Portal a <body>: el <header> usa backdrop-filter, que convierte al encabezado en el bloque
  // contenedor de los position: fixed y recortaría el panel a la altura de la barra.
  return createPortal(
    <div className={styles.velo} onMouseDown={(evento) => { if (evento.target === evento.currentTarget) alCerrar() }}>
      <div id={id} ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={tituloId}
        className={styles.panel} onKeyDown={alTeclear}>
        <div className={styles.panelEncabezado}>
          <img src="/flyBlanco.svg" alt="" className={styles.panelLogo} />
          <h2 id={tituloId} className={styles.oculto}>Menú</h2>
          <button ref={botonCerrarRef} type="button" className={styles.iconoBtn} aria-label="Cerrar menú" onClick={alCerrar}>
            <Icono nombre="x" />
          </button>
        </div>

        <Buscador />

        <nav aria-label="Categorías" className={styles.panelSeccion}>
          <Texto variante="sobretitulo" tono="secundario">Tienda</Texto>
          <ul className={styles.panelLista}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.ruta}>
                <NavLink to={categoria.ruta} className={styles.panelCategoria} onClick={alCerrar}>
                  {categoria.nombre} <Icono nombre="chevron-right" tamano={18} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <section className={styles.panelSeccion} aria-label="Tu cuenta">
          <Texto variante="sobretitulo" tono="secundario">Tu cuenta</Texto>
          {usuario ? (
            <>
              <div className={styles.panelUsuario}>
                <span className={styles.avatar} aria-hidden="true">{usuario.iniciales}</span>
                <div>
                  <Texto variante="etiqueta-fuerte">{usuario.nombre}</Texto>
                  <Texto variante="mini" tono="secundario" className={styles.correo}>{usuario.correo}</Texto>
                </div>
              </div>
              <ul className={styles.panelLista}>
                {enlacesDeCuenta(usuario.rol).map((enlace) => (
                  <li key={enlace.ruta}>
                    <Link to={enlace.ruta} className={styles.opcionCuenta} onClick={alCerrar}>
                      <Icono nombre={enlace.icono} tamano={18} /> {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to={RUTAS_CUENTA.carrito} className={styles.opcionCuenta} onClick={alCerrar}>
                    <Icono nombre="cart" tamano={18} /> Carrito
                  </Link>
                </li>
              </ul>
              <button type="button" className={`${styles.opcionCuenta} ${styles.opcionSalir}`} onClick={alSalir}>
                <Icono nombre="logout" tamano={18} /> Cerrar sesión
              </button>
            </>
          ) : (
            <div className={styles.panelAcceso}>
              <Link to={RUTAS_CUENTA.iniciarSesion} className={styles.botonEntrar} onClick={alCerrar}>Iniciar sesión</Link>
              <Link to={RUTAS_CUENTA.registro} className={styles.botonSecundario} onClick={alCerrar}>Crear cuenta</Link>
            </div>
          )}
        </section>

        <nav aria-label="Ayuda" className={styles.panelSeccion}>
          <Texto variante="sobretitulo" tono="secundario">Ayuda</Texto>
          <ul className={styles.panelLista}>
            <li><Link to={RUTAS_AYUDA.preguntasFrecuentes} className={styles.opcionCuenta} onClick={alCerrar}><Icono nombre="help" tamano={18} /> Preguntas frecuentes</Link></li>
            <li><Link to={RUTAS_AYUDA.terminos} className={styles.opcionCuenta} onClick={alCerrar}><Icono nombre="file" tamano={18} /> Términos y condiciones</Link></li>
            <li><Link to={RUTAS_AYUDA.privacidad} className={styles.opcionCuenta} onClick={alCerrar}><Icono nombre="lock" tamano={18} /> Aviso de privacidad</Link></li>
          </ul>
        </nav>
      </div>
    </div>,
    document.body,
  )
}
