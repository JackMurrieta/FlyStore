/**
 * Inicio del panel: pendientes con datos reales (endpoints que ya existen) y accesos rápidos.
 * No hay endpoint de métricas: los tableros de ventas van en «Reportes» cuando exista su backend.
 */

import { Link } from 'react-router-dom'
import { useSesion } from '@compartido/sesion'
import { Icono, type NombreIcono } from '@compartido/ui/iconos/Icono'
import { Boton } from '@compartido/ui/Boton'
import type { ConteoTs } from '../../dominio/ResumenTiendaTs'
import { useModelosPanel } from '../PanelTiendaContext'
import { useResumenTienda } from '../hooks/useResumenTienda'
import { RUTA_PANEL, SECCIONES_PANEL, seccionesPara } from '../secciones'
import estilos from '../componentes/panel.module.css'

const horaCorta = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' })

export function InicioPanelView() {
  const { usuario } = useSesion()
  const { resumen: modelo } = useModelosPanel()
  const { resumen, cargando, actualizado, recargar } = useResumenTienda(modelo)
  const primerNombre = usuario?.nombre.split(' ')[0]
  const proximas = seccionesPara(usuario?.rol).filter((s) => !s.disponible)
  const cargandoPrimeraVez = cargando && !resumen

  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <div>
          <p className={estilos.sobretitulo}>Administrar tienda</p>
          <h1 className={estilos.titulo}>{primerNombre ? `Hola, ${primerNombre}` : 'Inicio'}</h1>
          <p className={estilos.subtitulo}>Esto es lo que requiere tu atención hoy.</p>
        </div>
        <div className={estilos.actualizado} aria-live="polite">
          {actualizado && <span>Actualizado a las {horaCorta.format(actualizado)}</span>}
          <Boton variante="secundario" cargando={cargando} icono={<Icono nombre="refresh" tamano={16} />} onClick={() => void recargar()}>
            Actualizar
          </Boton>
        </div>
      </header>

      <section aria-labelledby="titulo-pendientes">
        <h2 id="titulo-pendientes" className={estilos.tituloSeccion}>Pendientes</h2>
        <div className={estilos.pendientes}>
          <Pendiente icono="cash" titulo="Pagos por confirmar" conteo={resumen?.pagosPorConfirmar} cargando={cargandoPrimeraVez}
            texto={(n) => n === 0 ? 'No hay comprobantes ni pagos en efectivo esperando.' : 'Comprobantes de transferencia y pagos en efectivo esperando revisión.'}
            accion="Revisar pedidos" ruta={`${RUTA_PANEL}/pedidos`} urgente />
          <Pendiente icono="file" titulo="Productos en borrador" conteo={resumen?.productosBorrador} cargando={cargandoPrimeraVez}
            texto={(n) => n === 0 ? 'Todo lo capturado ya está publicado.' : 'Aún no se ven en la tienda. Complétalos y publícalos.'}
            accion="Ver borradores" ruta={`${RUTA_PANEL}/catalogo?estado=BORRADOR`} />
          <Pendiente icono="alert-triangle" titulo="Stock bajo" conteo={resumen?.productosStockBajo} cargando={cargandoPrimeraVez}
            texto={(n) => n === 0 ? 'Ningún producto marcado con stock bajo.' : 'Productos con pocas piezas: conviene resurtir.'}
            accion="Ver stock bajo" ruta={`${RUTA_PANEL}/catalogo?estado=STOCK_BAJO`} urgente />
        </div>
      </section>

      <section aria-labelledby="titulo-accesos">
        <h2 id="titulo-accesos" className={estilos.tituloSeccion}>Accesos rápidos</h2>
        <div className={estilos.accesos}>
          <Acceso ruta={`${RUTA_PANEL}/catalogo/nuevo`} icono="plus" titulo="Nuevo producto" detalle="Con variantes y fotos por color" principal />
          <Acceso ruta={`${RUTA_PANEL}/pedidos`} icono="clipboard" titulo="Pedidos" detalle={SECCIONES_PANEL[1]!.descripcion} />
          <Acceso ruta={`${RUTA_PANEL}/catalogo`} icono="tag" titulo="Catálogo" detalle="Buscar, editar o dar de baja" />
          <Acceso ruta="/" icono="store" titulo="Ver la tienda" detalle="Como la ven tus clientes" />
        </div>
      </section>

      {proximas.length > 0 && (
        <section aria-labelledby="titulo-proximas">
          <h2 id="titulo-proximas" className={estilos.tituloSeccion}>Próximamente en el panel</h2>
          <div className={estilos.proximas}>
            {proximas.map((s) => (
              <Link key={s.clave} to={s.ruta} className={estilos.proxima}>
                <Icono nombre={s.icono} tamano={18} /> {s.etiqueta}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface PendienteProps {
  readonly icono: NombreIcono
  readonly titulo: string
  readonly conteo: ConteoTs | null | undefined
  readonly cargando: boolean
  readonly texto: (cantidad: number) => string
  readonly accion: string
  readonly ruta: string
  /** Resalta la cifra cuando hay algo pendiente. */
  readonly urgente?: boolean
}

function Pendiente({ icono, titulo, conteo, cargando, texto, accion, ruta, urgente }: PendienteProps) {
  const sinDatos = !cargando && !conteo
  return (
    <article className={estilos.pendiente} aria-busy={cargando}>
      <header>
        <h3>{titulo}</h3>
        <span className={estilos.icono} aria-hidden="true"><Icono nombre={icono} tamano={18} /></span>
      </header>
      {cargando ? <div className={estilos.esqueleto} role="status" aria-label={`Cargando ${titulo.toLowerCase()}`} />
        : sinDatos ? <p className={estilos.cifra}><span aria-hidden="true">—</span><small>No disponible</small></p>
          : (
            <p className={`${estilos.cifra} ${urgente && conteo!.cantidad > 0 ? estilos.atencion : ''}`}>
              {conteo!.cantidad}{conteo!.hayMas && '+'}
            </p>
          )}
      <p>{sinDatos ? 'No se pudo consultar. Intenta con «Actualizar».' : conteo ? texto(conteo.cantidad) : ' '}</p>
      <Link to={ruta}>{accion} <Icono nombre="arrow-right" tamano={14} /></Link>
    </article>
  )
}

interface AccesoProps {
  readonly ruta: string
  readonly icono: NombreIcono
  readonly titulo: string
  readonly detalle: string
  readonly principal?: boolean
}

function Acceso({ ruta, icono, titulo, detalle, principal }: AccesoProps) {
  return (
    <Link to={ruta} className={`${estilos.acceso} ${principal ? estilos.accesoPrincipal : ''}`}>
      <span className={estilos.icono} aria-hidden="true"><Icono nombre={icono} tamano={18} /></span>
      <span><strong>{titulo}</strong><small>{detalle}</small></span>
    </Link>
  )
}

export default InicioPanelView
