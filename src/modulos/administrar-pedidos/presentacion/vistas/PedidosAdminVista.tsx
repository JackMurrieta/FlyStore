/**
 * Vista de la lista de pedidos del administrador (Front 1 y 2 del diseño)
 * Ruta: /admin/pedidos (RutaProtegida roles ADMIN y EMPLEADO)
 * Búsqueda por folio, nombre o teléfono; filtros por estado, método de pago y rango de fechas;
 * 50 pedidos por página (como los devuelve el backend).
 */

import { useState, type FormEvent } from 'react'
import { contenedor } from '@app/contenedor'
import { Texto } from '@compartido/ui/Texto'
import { Campo } from '@compartido/ui/Campo'
import { Boton } from '@compartido/ui/Boton'
import { Chip } from '@compartido/ui/Chip'
import { Aviso } from '@compartido/ui/Aviso'
import { Insignia } from '@compartido/ui/Insignia'
import { Icono } from '@compartido/ui/iconos/Icono'
import { usePedidosAdmin } from '../hooks/usePedidosAdmin'
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO, type EstadoPedidoTs } from '../../dominio/EstadoPedidoTs'
import { METODOS_PAGO, ETIQUETA_METODO_PAGO, type MetodoPagoTs } from '../../dominio/MetodoPagoTs'
import { CRITERIOS_VACIOS } from '../../dominio/CriteriosBusquedaTs'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import { formatearFecha, formatearMoneda, tonoEstado } from '../formato'
import { DialogoRegistrarPagoEfectivo } from './DialogoRegistrarPagoEfectivo'
import styles from './PedidosAdminVista.module.css'

/** Valor de un campo de fecha (AAAA-MM-DD) como fecha local; null si está vacío */
function aFechaLocal(valor: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  return partes ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])) : null
}

/** Filtros que se capturan en la vista antes de buscar */
interface Filtros {
  readonly texto: string
  readonly estado: EstadoPedidoTs | null
  readonly metodoPago: MetodoPagoTs | null
  readonly desde: string
  readonly hasta: string
}

const FILTROS_VACIOS: Filtros = { texto: '', estado: null, metodoPago: null, desde: '', hasta: '' }

export default function PedidosAdminVista() {
  const model = contenedor.pedidosAdminModel
  const {
    pedidos,
    totalEncontrado,
    pagina,
    totalPaginas,
    hayFiltros,
    cargando,
    error,
    mensaje,
    buscar,
    limpiarFiltros,
    irAPagina,
    limpiarAvisos,
    irADetalle,
  } = usePedidosAdmin(model)

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS)
  const [pedidoPago, setPedidoPago] = useState<PedidoResumenTs | null>(null)
  const { texto, estado, metodoPago, desde, hasta } = filtros

  /** Cambia los filtros y busca desde la primera página */
  const ejecutarBusqueda = (cambios: Partial<Filtros>) => {
    const nuevos = { ...filtros, ...cambios }
    setFiltros(nuevos)
    void buscar({
      ...CRITERIOS_VACIOS,
      texto: nuevos.texto,
      estado: nuevos.estado,
      metodoPago: nuevos.metodoPago,
      desde: aFechaLocal(nuevos.desde),
      hasta: aFechaLocal(nuevos.hasta),
    })
  }

  const manejarSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    ejecutarBusqueda({})
  }

  const alternarEstado = (valor: EstadoPedidoTs) => {
    ejecutarBusqueda({ estado: estado === valor ? null : valor })
  }

  const alternarMetodo = (valor: MetodoPagoTs) => {
    ejecutarBusqueda({ metodoPago: metodoPago === valor ? null : valor })
  }

  const manejarLimpiar = () => {
    setFiltros(FILTROS_VACIOS)
    void limpiarFiltros()
  }

  return (
    <div className={styles.pagina}>
      {/* Se pinta dentro del panel «Administrar tienda», que ya aporta <main> y la barra superior */}
      <div className={styles.main}>
        <header className={styles.encabezado}>
          <div>
            <Texto variante="sobretitulo" tono="secundario">
              Panel de administración
            </Texto>
            <Texto variante="h1" como="h1">
              Pedidos
            </Texto>
          </div>
          <Texto variante="cuerpo-s" tono="secundario">
            {totalEncontrado} {totalEncontrado === 1 ? 'pedido' : 'pedidos'}
          </Texto>
        </header>

        {/* Búsqueda y filtros */}
        <section className={styles.filtros} aria-label="Buscar y filtrar pedidos">
          <form className={styles.busqueda} onSubmit={manejarSubmit}>
            <Campo
              type="search"
              value={texto}
              onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })}
              placeholder="Buscar por folio, nombre o teléfono"
              aria-label="Buscar pedidos"
            />
            <Boton type="submit" variante="secundario" icono={<Icono nombre="search" tamano={18} />} disabled={cargando}>
              Buscar
            </Boton>
          </form>

          <div className={styles.chips} role="group" aria-label="Filtrar por estado">
            {ESTADOS_PEDIDO.map((valor) => (
              <Chip key={valor} activo={estado === valor} onClick={() => alternarEstado(valor)}>
                {ETIQUETA_ESTADO[valor]}
              </Chip>
            ))}
          </div>

          <div className={styles.fechas} role="group" aria-label="Filtrar por fecha del pedido">
            {/* Días completos en la hora de la tienda; «hasta» no puede quedar antes de «desde» */}
            <Campo
              etiqueta="Desde"
              type="date"
              value={desde}
              max={hasta || undefined}
              onChange={(e) => ejecutarBusqueda({ desde: e.target.value })}
              disabled={cargando}
            />
            <Campo
              etiqueta="Hasta"
              type="date"
              value={hasta}
              min={desde || undefined}
              onChange={(e) => ejecutarBusqueda({ hasta: e.target.value })}
              disabled={cargando}
            />
          </div>

          <div className={styles.chips} role="group" aria-label="Filtrar por método de pago">
            {METODOS_PAGO.map((valor) => (
              <Chip key={valor} activo={metodoPago === valor} onClick={() => alternarMetodo(valor)}>
                {ETIQUETA_METODO_PAGO[valor]}
              </Chip>
            ))}
            {hayFiltros && (
              <Boton variante="fantasma" onClick={manejarLimpiar} icono={<Icono nombre="x" tamano={16} />}>
                Limpiar filtros
              </Boton>
            )}
          </div>
        </section>

        {error && <Aviso tono="error">{error.mensaje}</Aviso>}
        {mensaje && (
          <div className={styles.avisoConCierre}>
            <Aviso tono="exito">{mensaje}</Aviso>
            <Boton variante="fantasma" onClick={limpiarAvisos} aria-label="Cerrar aviso">
              <Icono nombre="x" tamano={16} />
            </Boton>
          </div>
        )}

        {/* Lista */}
        {cargando && pedidos.length === 0 ? (
          <Texto variante="cuerpo" tono="secundario" como="p">
            Cargando pedidos...
          </Texto>
        ) : pedidos.length === 0 ? (
          <div className={styles.vacio}>
            <Icono nombre="search-x" tamano={32} />
            <Texto variante="h3" como="h2">
              No se encontraron pedidos
            </Texto>
            <Texto variante="cuerpo-s" tono="secundario">
              Revisa los criterios de búsqueda o limpia los filtros.
            </Texto>
            {hayFiltros && (
              <Boton variante="secundario" onClick={manejarLimpiar}>
                Limpiar filtros
              </Boton>
            )}
          </div>
        ) : (
          <div className={styles.tablaContenedor}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Límite</th>
                  <th>
                    <span className={styles.oculto}>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.folio} className={styles.fila}>
                    <td>
                      <Texto variante="etiqueta-fuerte">{pedido.folio}</Texto>
                    </td>
                    <td>{formatearFecha(pedido.fechaCreacion)}</td>
                    <td>
                      <div className={styles.cliente}>
                        <span>{pedido.clienteNombre}</span>
                        {pedido.clienteTelefono && (
                          <Texto variante="mini" tono="secundario">
                            {pedido.clienteTelefono}
                          </Texto>
                        )}
                      </div>
                    </td>
                    <td>{formatearMoneda(pedido.total)}</td>
                    <td>{ETIQUETA_METODO_PAGO[pedido.metodoPago]}</td>
                    <td>
                      <Insignia tono={tonoEstado(pedido.estado)}>{ETIQUETA_ESTADO[pedido.estado]}</Insignia>
                    </td>
                    <td>{formatearFecha(pedido.fechaLimite)}</td>
                    <td>
                      <div className={styles.acciones}>
                        {pedido.estado === 'APARTADO_PENDIENTE_PAGO' && (
                          <Boton
                            variante="secundario"
                            icono={<Icono nombre="cash" tamano={16} />}
                            onClick={() => setPedidoPago(pedido)}
                          >
                            Registrar pago
                          </Boton>
                        )}
                        <Boton
                          variante="fantasma"
                          icono={<Icono nombre="eye" tamano={16} />}
                          onClick={() => irADetalle(pedido.folio)}
                        >
                          Ver detalle
                        </Boton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPaginas > 1 && pedidos.length > 0 && (
          <nav className={styles.paginacion} aria-label="Páginas de pedidos">
            <Boton
              variante="secundario"
              icono={<Icono nombre="chevron-left" tamano={16} />}
              onClick={() => void irAPagina(pagina - 1)}
              disabled={cargando || pagina <= 1}
            >
              Anterior
            </Boton>
            <Texto variante="cuerpo-s" tono="secundario" aria-live="polite">
              Página {pagina} de {totalPaginas}
            </Texto>
            <Boton
              variante="secundario"
              onClick={() => void irAPagina(pagina + 1)}
              disabled={cargando || pagina >= totalPaginas}
            >
              Siguiente
            </Boton>
          </nav>
        )}
      </div>

      <DialogoRegistrarPagoEfectivo
        key={pedidoPago?.folio ?? 'cerrado'}
        pedido={pedidoPago}
        model={model}
        alCerrar={() => setPedidoPago(null)}
      />
    </div>
  )
}
