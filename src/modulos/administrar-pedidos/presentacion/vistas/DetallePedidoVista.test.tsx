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

// El encabezado depende de la sesión y no es parte de lo que se prueba
vi.mock('@compartido/layout/Header', () => ({ Header: () => null }))

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

const detallePagado: DetallePedidoAdminTs = { ...detalleEnRevision, estado: 'PAGADO' }
const envio = { paqueteria: 'Estafeta', guia: '7210 4455 0193', entregaLocal: false }
const detalleEnviado: DetallePedidoAdminTs = { ...detallePagado, estado: 'ENVIADO', envio }

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
    aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: true }),
    rechazarComprobante: vi.fn().mockResolvedValue({
      pedido: { ...detalleEnRevision, estado: 'PENDIENTE_COMPROBANTE' },
      notificacionEnviada: true,
    }),
    actualizarEstado: vi.fn().mockResolvedValue({ pedido: detalleEnviado, notificacionEnviada: true }),
    cancelarPedido: vi.fn().mockResolvedValue({
      pedido: { ...detallePagado, estado: 'CANCELADO' },
      notificacionEnviada: true,
    }),
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
  it('ofrece aprobar, rechazar y cancelar cuando el pago está en revisión', async () => {
    await abrirDetalle(crearServicio())

    expect(boton('Aprobar pago')).toBeEnabled()
    expect(boton('Rechazar comprobante')).toBeEnabled()
    expect(boton('Cancelar pedido')).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Actualizar estado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('aprueba el pago tras confirmar y muestra el pedido como pagado', async () => {
    const servicio = crearServicio()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Aprobar pago'))
    expect(dialogo().getByText(`¿Aprobar el pago de ${FOLIO}?`)).toBeInTheDocument()
    expect(dialogo().getByText(/se descontarán de forma definitiva las 11 piezas reservadas/)).toBeInTheDocument()
    expect(servicio.aprobarPago).not.toHaveBeenCalled()

    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.aprobarPago).toHaveBeenCalledWith(FOLIO)
    expect(screen.getByText('Pago aprobado. El pedido quedó como pagado.')).toBeInTheDocument()
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
      aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: false }),
    })
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Aprobar pago'))
    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))
    await usuario.click(await screen.findByRole('button', { name: 'Notificar por WhatsApp' }))

    expect(screen.getByText(/No pudimos avisar a Ana Torres/)).toBeInTheDocument()
    expect(abrir).toHaveBeenCalledTimes(1)
    const [url, destino] = abrir.mock.calls[0] ?? []
    expect(String(url)).toMatch(/^https:\/\/wa\.me\/526441234567\?text=/)
    expect(decodeURIComponent(String(url))).toContain(`Confirmamos el pago de tu pedido ${FOLIO}`)
    expect(destino).toBe('_blank')
  })

  it('si el backend responde 409 muestra el error en el diálogo y permite reintentar', async () => {
    const aprobarPago = vi
      .fn()
      .mockRejectedValueOnce(new ErrorApi('El pedido ya no está en revisión', 'NEGOCIO', 'ESTADO_CAMBIO', undefined, 409))
      .mockResolvedValueOnce({ pedido: detallePagado, notificacionEnviada: true })
    const { usuario } = await abrirDetalle(crearServicio({ aprobarPago }))

    await usuario.click(boton('Aprobar pago'))
    await usuario.click(dialogo().getByRole('button', { name: 'Aprobar pago' }))

    expect(await dialogo().findByText('El pedido ya no está en revisión')).toBeInTheDocument()
    await usuario.click(dialogo().getByRole('button', { name: 'Reintentar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(aprobarPago).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('El pedido ya no está en revisión')).not.toBeInTheDocument()
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
    const cancelado: DetallePedidoAdminTs = {
      ...detalleEnRevision,
      estado: 'CANCELADO',
      historial: [
        {
          fechaHora: new Date('2026-10-23T18:50:00'),
          usuario: 'Luis Castillo',
          estadoAnterior: 'PAGO_EN_REVISION',
          estadoNuevo: 'CANCELADO',
          motivo: null,
        },
      ],
    }
    const servicio = crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(cancelado) })
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()
    const { usuario } = await abrirDetalle(servicio, model)

    expect(screen.getByText('Este pedido ya no está en «Pago en revisión»')).toBeInTheDocument()
    expect(screen.getByText(/Luis Castillo lo pasó a «Cancelado»/)).toBeInTheDocument()
    expect(boton('Aprobar pago')).toBeDisabled()
    expect(boton('Rechazar comprobante')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()

    await usuario.click(boton('Volver a pedidos'))
    expect(screen.getByText('Lista de pedidos')).toBeInTheDocument()
  })
})

describe('DetallePedidoVista · Front 4 · actualizar estado y cancelar', () => {
  const servicioPagado = (sobrescribir: Partial<IPedidosAdminService> = {}) =>
    crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(detallePagado), ...sobrescribir })

  it('en un pedido pagado propone «Enviado» y no envía sin paquetería ni guía', async () => {
    const servicio = servicioPagado()
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
    const servicio = servicioPagado()
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
    const servicio = servicioPagado()
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
    const servicio = servicioPagado()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Actualizar estado'))
    await usuario.click(dialogo().getByRole('button', { name: /Entregado/ }))
    await usuario.click(dialogo().getByRole('button', { name: 'Marcar como entregado' }))

    expect(dialogo().getByText('Desde «Pagado» solo se puede pasar a «Enviado».')).toBeInTheDocument()
    expect(servicio.actualizarEstado).not.toHaveBeenCalled()

    // Al corregir el estado el error desaparece y vuelve el formulario de envío
    await usuario.click(dialogo().getByRole('button', { name: /Enviado/ }))
    expect(dialogo().queryByText('Desde «Pagado» solo se puede pasar a «Enviado».')).not.toBeInTheDocument()
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
  })

  it('un pedido enviado no se puede cancelar: avisa y no abre el diálogo', async () => {
    const servicio = crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(detalleEnviado) })
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Cancelar pedido'))

    expect(screen.getByText('El pedido ya salió de la tienda y no se puede cancelar.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(servicio.cancelarPedido).not.toHaveBeenCalled()
  })

  it('cancela un pedido pagado advirtiendo la devolución y exigiendo el motivo', async () => {
    const servicio = servicioPagado()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Cancelar pedido'))
    expect(dialogo().getByText('El pedido ya estaba «Pagado»')).toBeInTheDocument()
    expect(dialogo().getByText(/Las 11 piezas regresarán al inventario y deberás devolver/)).toBeInTheDocument()

    await usuario.click(dialogo().getByRole('button', { name: 'Cancelar pedido' }))
    expect(dialogo().getByText('Indica el motivo de la cancelación.')).toBeInTheDocument()
    expect(servicio.cancelarPedido).not.toHaveBeenCalled()

    await usuario.type(dialogo().getByLabelText(/Motivo de la cancelación/), 'Cambio de talla')
    await usuario.click(dialogo().getByRole('button', { name: 'Cancelar pedido' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(servicio.cancelarPedido).toHaveBeenCalledWith(FOLIO, 'Cambio de talla')
    expect(screen.getByText(/Pedido cancelado/)).toBeInTheDocument()
    expect(screen.getByText('El pedido está cancelado y ya no admite acciones.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
  })

  it('«Volver» cierra el diálogo de cancelación sin cancelar', async () => {
    const servicio = servicioPagado()
    const { usuario } = await abrirDetalle(servicio)

    await usuario.click(boton('Cancelar pedido'))
    await usuario.click(dialogo().getByRole('button', { name: 'Volver' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(servicio.cancelarPedido).not.toHaveBeenCalled()
  })

  it('si falla la carga del detalle muestra el error y «Reintentar» vuelve a pedirlo', async () => {
    const obtenerDetalle = vi
      .fn()
      .mockRejectedValueOnce(ErrorApi.red())
      .mockResolvedValueOnce(detallePagado)
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
