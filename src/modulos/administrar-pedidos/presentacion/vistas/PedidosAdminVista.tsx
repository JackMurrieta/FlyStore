/**
 * Vista de la lista de pedidos del administrador (Front 1 y 2 del diseño)
 * Ruta: /admin/pedidos (RutaProtegida roles ADMIN y EMPLEADO)
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

export default function PedidosAdminVista() {
  const model = contenedor.pedidosAdminModel
  const { pedidos, totalEncontrado, hayFiltros, cargando, error, mensaje, buscar, limpiarFiltros, limpiarAvisos, irADetalle } =
    usePedidosAdmin(model)

  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<EstadoPedidoTs | null>(null)
  const [metodoPago, setMetodoPago] = useState<MetodoPagoTs | null>(null)
  const [pedidoPago, setPedidoPago] = useState<PedidoResumenTs | null>(null)

  const ejecutarBusqueda = (
    nuevoTexto: string,
    nuevoEstado: EstadoPedidoTs | null,
    nuevoMetodo: MetodoPagoTs | null
  ) => {
    void buscar({ ...CRITERIOS_VACIOS, texto: nuevoTexto, estado: nuevoEstado, metodoPago: nuevoMetodo })
  }

  const manejarSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    ejecutarBusqueda(texto, estado, metodoPago)
  }

  const alternarEstado = (valor: EstadoPedidoTs) => {
    const nuevo = estado === valor ? null : valor
    setEstado(nuevo)
    ejecutarBusqueda(texto, nuevo, metodoPago)
  }

  const alternarMetodo = (valor: MetodoPagoTs) => {
    const nuevo = metodoPago === valor ? null : valor
    setMetodoPago(nuevo)
    ejecutarBusqueda(texto, estado, nuevo)
  }

  const manejarLimpiar = () => {
    setTexto('')
    setEstado(null)
    setMetodoPago(null)
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
              onChange={(e) => setTexto(e.target.value)}
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
