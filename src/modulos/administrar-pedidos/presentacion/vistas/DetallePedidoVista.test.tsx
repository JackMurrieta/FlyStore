import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { IPedidosAdminService } from '../../dominio/puertos/IPedidosAdminService'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import DetallePedidoVista from './DetallePedidoVista'

// La vista toma el modelo del contenedor: cada prueba pone aquí el suyo
const referencia = vi.hoisted(() => ({ model: null as unknown }))

vi.mock('@app/contenedor', () => ({
  contenedor: {
    get pedidosAdminModel() {
      return referencia.model
    },
  },
}))

const FOLIO = 'FLY-000128'

const detalleEnRevision: DetallePedidoAdminTs = {
  folio: FOLIO,
  estado: 'PAGO_EN_REVISION',
  fechaCreacion: new Date('2026-10-23T18:41:00'),
  fechaLimite: null,
  cliente: { id: 7, nombre: 'Ana Torres', telefono: '644 123 4567' },
  datosEntrega: 'Calle 5 de Febrero 1234, Cd. Obregón',
  lineas: [
    { producto: 'Gorra 9FORTY', talla: 'Ajustable', cantidad: 6, precioUnitario: 210, subtotal: 1260 },
    { producto: 'Air Force 1', talla: '27 MX', cantidad: 5, precioUnitario: 590, subtotal: 2950 },
  ],
  total: 4210,
  metodoPago: 'TRANSFERENCIA',
  comprobante: {
    url: 'https://ejemplo.test/comprobante.jpg',
    nombreArchivo: 'comprobante_ana_torres.jpg',
    monto: 4210,
    fecha: new Date('2026-10-23T18:39:00'),
    concepto: 'Ana Torres',
    estado: 'EN_REVISION',
  },
  envio: null,
  historial: [],
}

// Una transferencia aprobada pasa directo a «En preparación»
const detallePreparacion: DetallePedidoAdminTs = {
  ...detalleEnRevision,
  estado: 'PREPARACION',
  comprobante: detalleEnRevision.comprobante && { ...detalleEnRevision.comprobante, estado: 'COMPLETADO' },
}
const envio = { paqueteria: 'Estafeta', guia: '7210 4455 0193', entregaLocal: false }
const detalleEnviado: DetallePedidoAdminTs = { ...detallePreparacion, estado: 'ENVIADO', envio }
const detalleEfectivoPagado: DetallePedidoAdminTs = {
  ...detalleEnRevision,
  folio: FOLIO,
  estado: 'PAGADO',
  metodoPago: 'EFECTIVO',
  comprobante: null,
}

const resumenEnRevision: PedidoResumenTs = {
  folio: FOLIO,
  fechaCreacion: detalleEnRevision.fechaCreacion,
  clienteNombre: 'Ana Torres',
  clienteTelefono: '644 123 4567',
  total: 4210,
  metodoPago: 'TRANSFERENCIA',
  estado: 'PAGO_EN_REVISION',
  fechaLimite: null,
}

function crearServicio(sobrescribir: Partial<IPedidosAdminService> = {}): IPedidosAdminService {
  return {
    listar: vi.fn().mockResolvedValue({ pedidos: [resumenEnRevision], totalEncontrado: 1 }),
    obtenerDetalle: vi.fn().mockResolvedValue(detalleEnRevision),
    registrarPagoEfectivo: vi.fn(),
    aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePreparacion, notificacionEnviada: true }),
    rechazarComprobante: vi.fn().mockResolvedValue({
      pedido: { ...detalleEnRevision, estado: 'PENDIENTE_COMPROBANTE' },
      notificacionEnviada: true,
    }),
    actualizarEstado: vi.fn().mockResolvedValue({ pedido: detalleEnviado, notificacionEnviada: true }),
    ...sobrescribir,
  }
}

/** Monta la vista en su ruta y espera a que el detalle esté en pantalla */
async function abrirDetalle(servicio: IPedidosAdminService, model = new PedidosAdminModel(servicio)) {
  referencia.model = model
  const usuario = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[`/admin/pedidos/${FOLIO}`]}>
      <Routes>
        <Route path="/admin/pedidos" element={<p>Lista de pedidos</p>} />
        <Route path="/admin/pedidos/:folio" element={<DetallePedidoVista />} />
      </Routes>
    </MemoryRouter>
  )
  await screen.findByRole('heading', { name: FOLIO })
  return { usuario, model }
}

const boton = (nombre: string | RegExp) => screen.getByRole('button', { name: nombre })
const dialogo = () => within(screen.getByRole('dialog'))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DetallePedidoVista · Front 3 · validar pago', () => {
  it('ofrece aprobar y rechazar cuando el pago está en revisión; el personal no cancela', async () => {
    await abrirDetalle(crearServicio())

    expect(boton('Aprobar pago')).toBeEnabled()
    expect(boton('Rechazar comprobante')).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('aprueba el pago tras confirmar y el pedido pasa a «En preparación»', async () => {
    const servicio = crearServicio()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Aprobar pago'))
    expect(dialogo().getByText(`¿Aprobar el pago de ${FOLIO}?`)).toBeInTheDocument()
    expect(dialogo().getByText(/El pedido pasará a «En preparación», se descontarán de forma definitiva las 11 piezas reservadas/)).toBeInTheDocument()
    expect(servicio.aprobarPago).not.toHaveBeenCalled()

    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.aprobarPago).toHaveBeenCalledWith(FOLIO)
    expect(screen.getByText('Pago aprobado. El pedido pasó a «En preparación».')).toBeInTheDocument()
    expect(screen.getAllByText('En preparación').length).toBeGreaterThan(0)
    expect(boton('Actualizar estado')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Aprobar pago' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Notificar por WhatsApp' })).not.toBeInTheDocument()
  })

  it('cancelar el diálogo de aprobación no llama al backend', async () => {
    const servicio = crearServicio()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Aprobar pago'))
    await usuario.click(dialogo().getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(servicio.aprobarPago).not.toHaveBeenCalled()
  })

  it('si no se pudo notificar ofrece «Notificar por WhatsApp» con el mensaje ya escrito', async () => {
    const abrir = vi.spyOn(window, 'open').mockImplementation(() => null)
    const servicio = crearServicio({
      aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePreparacion, notificacionEnviada: false }),
    })
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Aprobar pago'))
    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))
    await usuario.click(await screen.findByRole('button', { name: 'Notificar por WhatsApp' }))

    expect(screen.getByText(/No pudimos avisar a Ana Torres/)).toBeInTheDocument()
    expect(abrir).toHaveBeenCalledTimes(1)
    const [url, destino] = abrir.mock.calls[0] ?? []
    expect(String(url)).toMatch(/^https:\/\/wa\.me\/526441234567\?text=/)
    expect(decodeURIComponent(String(url))).toContain(`Confirmamos el pago de tu pedido ${FOLIO} y ya lo estamos preparando`)
    expect(destino).toBe('_blank')
  })

  it('si otra persona ya cambió el pedido (409) lo recarga, cierra el diálogo y muestra el motivo', async () => {
    const mensaje = 'El pedido FLY-000128 ya no está en «Pago en revisión»: ahora está en «En preparación». Vuelve a cargarlo.'
    const obtenerDetalle = vi.fn().mockResolvedValueOnce(detalleEnRevision).mockResolvedValueOnce(detallePreparacion)
    const aprobarPago = vi.fn().mockRejectedValue(new ErrorApi(mensaje, 'NEGOCIO', 'CONFLICTO_DE_DATOS', undefined, 409))
    const { usuario } = await abrirDetalle(crearServicio({ obtenerDetalle, aprobarPago }))

    await usuario.click(boton('Aprobar pago'))
    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(obtenerDetalle).toHaveBeenCalledTimes(2)
    expect(screen.getByText(mensaje)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Aprobar pago' })).not.toBeInTheDocument()
    expect(boton('Actualizar estado')).toBeInTheDocument()
    // Un 409 no se arregla reintentando: el pedido ya muestra su estado real
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })

  it('si el 409 no cambió el estado (sin stock) el diálogo sigue abierto y permite reintentar', async () => {
    const mensaje = 'No hay piezas suficientes de Gorra 9FORTY: el pedido necesita 6 y hay 3.'
    const aprobarPago = vi
      .fn()
      .mockRejectedValueOnce(new ErrorApi(mensaje, 'NEGOCIO', 'CONFLICTO_DE_DATOS', undefined, 409))
      .mockResolvedValueOnce({ pedido: detallePreparacion, notificacionEnviada: true })
    const { usuario } = await abrirDetalle(crearServicio({ aprobarPago }))

    await usuario.click(boton('Aprobar pago'))
    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))

    expect(await dialogo().findByText(mensaje)).toBeInTheDocument()
    await usuario.click(dialogo().getByRole('button', { name: 'Reintentar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(aprobarPago).toHaveBeenCalledTimes(2)
    expect(screen.queryByText(mensaje)).not.toBeInTheDocument()
  })

  it('si el comprobante llega sin enlace lo explica en vez de mostrar un enlace roto', async () => {
    const sinEnlace: DetallePedidoAdminTs = {
      ...detalleEnRevision,
      comprobante: detalleEnRevision.comprobante && { ...detalleEnRevision.comprobante, url: '' },
    }
    await abrirDetalle(crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(sinEnlace) }))

    expect(screen.getByText('No se pudo cargar el archivo. Recarga el pedido para intentarlo de nuevo.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /comprobante_ana_torres/ })).not.toBeInTheDocument()
  })

  it('no rechaza sin motivo: pide indicarlo y lo quita al elegir uno', async () => {
    const servicio = crearServicio()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Rechazar comprobante'))
    await usuario.click(dialogo().getByRole('button', { name: 'Rechazar comprobante' }))

    expect(dialogo().getByText('Indica el motivo del rechazo.')).toBeInTheDocument()
    expect(servicio.rechazarComprobante).not.toHaveBeenCalled()

    await usuario.click(dialogo().getByRole('radio', { name: 'El monto no coincide' }))
    expect(dialogo().queryByText('Indica el motivo del rechazo.')).not.toBeInTheDocument()
  })

  it('rechaza el comprobante con el motivo elegido y el mensaje opcional', async () => {
    const servicio = crearServicio()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Rechazar comprobante'))
    await usuario.click(dialogo().getByRole('radio', { name: 'El monto no coincide' }))
    await usuario.type(dialogo().getByLabelText('Mensaje para el cliente (opcional)'), 'Faltan $210')
    await usuario.click(dialogo().getByRole('button', { name: 'Rechazar comprobante' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.rechazarComprobante).toHaveBeenCalledWith(FOLIO, 'El monto no coincide', 'Faltan $210')
    expect(screen.getByText(/Comprobante rechazado/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Aprobar pago' })).not.toBeInTheDocument()
  })

  it('si el pedido salió de revisión mientras tanto lo avisa y deshabilita aprobar y rechazar', async () => {
    const aprobado: DetallePedidoAdminTs = {
      ...detallePreparacion,
      historial: [
        {
          fechaHora: new Date('2026-10-23T18:50:00'),
          usuario: 'Luis Castillo',
          estadoAnterior: 'PAGO_EN_REVISION',
          estadoNuevo: 'PREPARACION',
          motivo: null,
        },
      ],
    }
    const servicio = crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(aprobado) })
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()
    const { usuario } = await abrirDetalle(servicio, model)

    expect(screen.getByText('Este pedido ya no está en «Pago en revisión»')).toBeInTheDocument()
    expect(screen.getByText(/Luis Castillo lo pasó a «En preparación»/)).toBeInTheDocument()
    expect(boton('Aprobar pago')).toBeDisabled()
    expect(boton('Rechazar comprobante')).toBeDisabled()

    await usuario.click(boton('Volver a pedidos'))
    expect(screen.getByText('Lista de pedidos')).toBeInTheDocument()
  })
})

describe('DetallePedidoVista · Front 4 · actualizar estado', () => {
  const servicioEnPreparacion = (sobrescribir: Partial<IPedidosAdminService> = {}) =>
    crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(detallePreparacion), ...sobrescribir })

  it('una transferencia en preparación propone «Enviado» y no envía sin paquetería ni guía', async () => {
    const servicio = servicioEnPreparacion()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    expect(dialogo().getByText('Siguiente estado permitido: Enviado')).toBeInTheDocument()
    expect(dialogo().getByRole('button', { name: /Enviado/, pressed: true })).toBeInTheDocument()

    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como enviado' }))

    expect(dialogo().getByText(/indica paquetería y guía, o marca entrega local/)).toBeInTheDocument()
    expect(dialogo().getByText('Indica la paquetería.')).toBeInTheDocument()
    expect(dialogo().getByText('Indica el número de guía.')).toBeInTheDocument()
    expect(servicio.actualizarEstado).not.toHaveBeenCalled()
  })

  it('marca como enviado con paquetería y guía', async () => {
    const servicio = servicioEnPreparacion()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    await usuario.type(dialogo().getByLabelText('Paquetería'), 'Estafeta')
    await usuario.type(dialogo().getByLabelText('Número de guía'), '7210 4455 0193')
    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como enviado' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.actualizarEstado).toHaveBeenCalledWith(FOLIO, 'ENVIADO', envio)
    expect(screen.getByText('Estado actualizado.')).toBeInTheDocument()
    expect(screen.getByText('Estafeta · guía 7210 4455 0193')).toBeInTheDocument()
  })

  it('marca como enviado por entrega local sin pedir guía', async () => {
    const servicio = servicioEnPreparacion()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    await usuario.click(dialogo().getByRole('radio', { name: 'Entrega local (sin guía)' }))
    expect(dialogo().queryByLabelText('Paquetería')).not.toBeInTheDocument()
    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como enviado' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.actualizarEstado).toHaveBeenCalledWith(FOLIO, 'ENVIADO', {
      paqueteria: '',
      guia: '',
      entregaLocal: true,
    })
  })

  it('no deja saltarse la secuencia: indica el siguiente estado válido', async () => {
    const servicio = servicioEnPreparacion()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    await usuario.click(dialogo().getByRole('button', { name: /Entregado/ }))
    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como entregado' }))

    expect(dialogo().getByText('Desde «En preparación» solo se puede pasar a «Enviado».')).toBeInTheDocument()
    expect(servicio.actualizarEstado).not.toHaveBeenCalled()

    // Al corregir el estado el error desaparece y vuelve el formulario de envío
    await usuario.click(dialogo().getByRole('button', { name: /Enviado/ }))
    expect(dialogo().queryByText('Desde «En preparación» solo se puede pasar a «Enviado».')).not.toBeInTheDocument()
    expect(dialogo().getByLabelText('Paquetería')).toBeInTheDocument()
  })

  it('de enviado pasa a entregado sin datos de envío', async () => {
    const servicio = crearServicio({
      obtenerDetalle: vi.fn().mockResolvedValue(detalleEnviado),
      actualizarEstado: vi.fn().mockResolvedValue({
        pedido: { ...detalleEnviado, estado: 'ENTREGADO' },
        notificacionEnviada: true,
      }),
    })
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    expect(dialogo().queryByRole('radiogroup')).not.toBeInTheDocument()
    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como entregado' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.actualizarEstado).toHaveBeenCalledWith(FOLIO, 'ENTREGADO', null)
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
    expect(screen.getByText('El pedido ya se entregó.')).toBeInTheDocument()
  })

  it('un pedido en efectivo pagado pasa directo a entregado, sin envío', async () => {
    const servicio = crearServicio({
      obtenerDetalle: vi.fn().mockResolvedValue(detalleEfectivoPagado),
      actualizarEstado: vi.fn().mockResolvedValue({
        pedido: { ...detalleEfectivoPagado, estado: 'ENTREGADO' },
        notificacionEnviada: true,
      }),
    })
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    expect(dialogo().getByText('Siguiente estado permitido: Entregado')).toBeInTheDocument()
    expect(dialogo().queryByRole('button', { name: /Enviado/ })).not.toBeInTheDocument()
    expect(dialogo().queryByRole('button', { name: /En preparación/ })).not.toBeInTheDocument()
    expect(dialogo().queryByRole('radiogroup')).not.toBeInTheDocument()
    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como entregado' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.actualizarEstado).toHaveBeenCalledWith(FOLIO, 'ENTREGADO', null)
  })

  it('un apartado en efectivo no tiene acciones aquí: el pago se registra desde la lista', async () => {
    const apartado: DetallePedidoAdminTs = { ...detalleEfectivoPagado, estado: 'APARTADO_PENDIENTE_PAGO' }
    await abrirDetalle(crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(apartado) }))

    expect(
      screen.getByText('Cuando el cliente pague en la tienda, registra el pago desde la lista de pedidos.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
  })

  it('un pedido cancelado por el cliente ya no admite acciones', async () => {
    const cancelado: DetallePedidoAdminTs = { ...detalleEnRevision, estado: 'CANCELADO' }
    await abrirDetalle(crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(cancelado) }))

    expect(screen.getByText('El pedido está cancelado y ya no admite acciones.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
  })

  it('si falla la carga del detalle muestra el error y «Reintentar» vuelve a pedirlo', async () => {
    const obtenerDetalle = vi
      .fn()
      .mockRejectedValueOnce(ErrorApi.red())
      .mockResolvedValueOnce(detallePreparacion)
    referencia.model = new PedidosAdminModel(crearServicio({ obtenerDetalle }))
    const usuario = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/admin/pedidos/${FOLIO}`]}>
        <Routes>
          <Route path="/admin/pedidos/:folio" element={<DetallePedidoVista />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Error de conexión. Verifica tu internet.')).toBeInTheDocument()
    await usuario.click(boton('Reintentar'))

    expect(await screen.findByRole('heading', { name: FOLIO })).toBeInTheDocument()
    expect(obtenerDetalle).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Error de conexión. Verifica tu internet.')).not.toBeInTheDocument()
  })
})
