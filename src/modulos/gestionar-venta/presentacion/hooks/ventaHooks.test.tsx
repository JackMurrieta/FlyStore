import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SesionProvider, type EstadoSesionTs, type ISesion } from '@compartido/sesion'
import { crearModelosVenta, type ModelosVenta } from '../../aplicacion/ModelosVenta'
import { gatewayFalso, pedidoFigma } from '../../pruebas/fixturesVenta'
import { GestionarVenta } from '../GestionarVenta'
import { MisPedidos } from '../MisPedidos'
import { ModelosVentaContext } from '../ModelosVentaContext'
import { useCarrito } from './useCarrito'
import { useNavegacionVenta } from './useNavegacionVenta'
import { useMetodoPago } from './useMetodoPago'

const ESTADO_SESION: EstadoSesionTs = {
  estado: 'autenticado',
  usuario: { id: 7, nombre: 'Ana Torres', correo: 'ana@correo.mx', telefono: null, rol: 'CLIENTE', perfilCompleto: true, iniciales: 'AT' },
}
const sesion: ISesion = { suscribir: () => () => {}, obtenerEstado: () => ESTADO_SESION, iniciarConGoogle: vi.fn(), cerrarSesion: vi.fn() }

function Ubicacion() {
  return <span data-testid="ruta">{useLocation().pathname}</span>
}

function envoltorio(modelos: ModelosVenta, ruta = '/carrito') {
  return function Envoltorio({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[ruta]}>
        <SesionProvider sesion={sesion}>
          <ModelosVentaContext.Provider value={{ modelos, rutaBase: '/carrito', rutaMisPedidos: '/mis-pedidos' }}>
            {children}
            <Ubicacion />
          </ModelosVentaContext.Provider>
        </SesionProvider>
      </MemoryRouter>
    )
  }
}

function renderizarModulo(modelos: ModelosVenta) {
  return render(
    <MemoryRouter initialEntries={['/carrito']}>
      <SesionProvider sesion={sesion}>
        <Routes><Route path="/carrito/*" element={<GestionarVenta modelos={modelos} />} /></Routes>
        <Ubicacion />
      </SesionProvider>
    </MemoryRouter>
  )
}

describe('ViewModels de gestionar venta', () => {
  it('useCarrito carga el carrito al montar con el clienteId de la sesión (básico 1–10)', async () => {
    const gateway = gatewayFalso()
    const modelos = crearModelosVenta(gateway)
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio(modelos) })
    await waitFor(() => expect(result.current.carrito?.total).toBe(4210))
    expect(gateway.obtenerPedidoVentaEnCurso).toHaveBeenCalledWith('7')
  })

  it('useCarrito limpia el campo al canjear el código y confirma antes de eliminar (S1)', async () => {
    const gateway = gatewayFalso()
    const modelos = crearModelosVenta(gateway)
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio(modelos) })
    await waitFor(() => expect(result.current.carrito).not.toBeNull())
    act(() => result.current.capturarCodigo('FLY10'))
    await act(() => result.current.aplicarCodigoDescuento('FLY10'))
    expect(result.current.codigoCapturado).toBe('')
    expect(result.current.carrito?.total).toBe(4084)

    const linea = result.current.carrito!.lineas[2]!
    act(() => result.current.solicitarEliminar(linea))
    expect(result.current.lineaPorEliminar).toBe(linea)
    await act(() => result.current.confirmarEliminar())
    expect(gateway.actualizarCantidad).toHaveBeenCalledWith({ varianteProductoId: linea.varianteProductoId, cantidad: 0 })
    expect(result.current.lineaPorEliminar).toBeNull()
  })

  it('useNavegacionVenta carga entrega y resumen antes de navegar, y no avanza al pago con datos incompletos (A5)', async () => {
    const gateway = gatewayFalso()
    const modelos = crearModelosVenta(gateway)
    await modelos.pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    const { result } = renderHook(() => ({ nav: useNavegacionVenta(), pago: useMetodoPago() }), { wrapper: envoltorio(modelos) })

    await act(() => result.current.nav.irDatosEntrega())
    expect(gateway.obtenerDatosEntrega).toHaveBeenCalledWith('7')
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/entrega')

    act(() => modelos.datosEntrega.actualizarDatosEntrega({ direccion: '' }))
    await act(() => result.current.nav.irMetodoPago())
    expect(gateway.obtenerDatosBancarios).not.toHaveBeenCalled()
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/entrega')

    act(() => modelos.datosEntrega.actualizarDatosEntrega({ direccion: 'Centro' }))
    await act(() => result.current.nav.irMetodoPago())
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/pago')

    // Alt3: efectivo → confirmación → registrado con ticket
    await act(async () => { await result.current.pago.elegirPagoEfectivo() })
    expect(result.current.pago.listoParaContinuar).toBe(true)
    await act(() => result.current.nav.irConfirmacion())
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/confirmacion')
    await act(() => result.current.nav.irPedidoRegistrado('FLY-000128'))
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/pedido/FLY-000128')
    await waitFor(() => expect(gateway.generarComprobantePedidoVenta).toHaveBeenCalledWith('FLY-000128'))
  })

  it('no navega a pedido registrado si el registro falla (A9)', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.registrarPedidoVenta).mockRejectedValue(new Error('No se pudo guardar'))
    const modelos = crearModelosVenta(gateway)
    await modelos.pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    await modelos.datosEntrega.obtenerDatosEntrega('7')
    await modelos.pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'EFECTIVO', folio: 'F' })
    const { result } = renderHook(() => useNavegacionVenta(), { wrapper: envoltorio(modelos, '/carrito/confirmacion') })
    await act(() => result.current.irPedidoRegistrado('F'))
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/confirmacion')
    expect(gateway.generarComprobantePedidoVenta).not.toHaveBeenCalled()
  })
})

describe('Vistas de gestionar venta', () => {
  it('CarritoView pinta las líneas y el total, y continúa a datos de entrega', async () => {
    const gateway = gatewayFalso()
    renderizarModulo(crearModelosVenta(gateway))
    expect(await screen.findByText('9FORTY LA Dodgers Negro')).toBeInTheDocument()
    expect(screen.getByText('$4,210 MXN')).toBeInTheDocument()
    expect(screen.getByText(/Mayoreo · 6–11 pzas/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Continuar con la compra/i }))
    expect(await screen.findByRole('heading', { name: '¿A dónde enviamos tu pedido?' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Torres')
  })

  it('CarritoView muestra el carrito vacío (A3)', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.obtenerPedidoVentaEnCurso).mockResolvedValue({ ...pedidoFigma(), detalles: [], totalPiezas: 0, total: 0 })
    renderizarModulo(crearModelosVenta(gateway))
    expect(await screen.findByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
  })

  it('regresa al carrito si se entra directo a un paso sin pedido en memoria', async () => {
    const modelos = crearModelosVenta(gatewayFalso())
    render(
      <MemoryRouter initialEntries={['/carrito/pago']}>
        <SesionProvider sesion={sesion}>
          <Routes><Route path="/carrito/*" element={<GestionarVenta modelos={modelos} />} /></Routes>
          <Ubicacion />
        </SesionProvider>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByTestId('ruta').textContent).toBe('/carrito'))
  })

  it('B7 se puede recargar: pide el pedido por su folio e imprime solo el ticket', async () => {
    const gateway = gatewayFalso()
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(
      <MemoryRouter initialEntries={['/carrito/pedido/FLY-000131']}>
        <SesionProvider sesion={sesion}>
          <Routes><Route path="/carrito/*" element={<GestionarVenta modelos={crearModelosVenta(gateway)} />} /></Routes>
          <Ubicacion />
        </SesionProvider>
      </MemoryRouter>
    )
    expect(await screen.findByRole('heading', { name: 'Folio FLY-000131' })).toBeInTheDocument()
    expect(gateway.generarComprobantePedidoVenta).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('ruta').textContent).toBe('/carrito/pedido/FLY-000131')
    expect(screen.getByText('Comprobante de pedido')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Ver \/ Imprimir ticket/ }))
    expect(imprimir).toHaveBeenCalled()
    imprimir.mockRestore()
  })

  it('B7 sin acceso al pedido muestra el error y permite ir a Mis pedidos', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.generarComprobantePedidoVenta).mockRejectedValue(new Error('No se encontró el pedido'))
    render(
      <MemoryRouter initialEntries={['/carrito/pedido/FLY-999999']}>
        <SesionProvider sesion={sesion}>
          <Routes><Route path="/carrito/*" element={<GestionarVenta modelos={crearModelosVenta(gateway)} />} /></Routes>
          <Ubicacion />
        </SesionProvider>
      </MemoryRouter>
    )
    expect(await screen.findByText('No se encontró el pedido')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Ver mis pedidos/ }))
    expect(screen.getByTestId('ruta').textContent).toBe('/mis-pedidos')
  })
})

describe('Mis pedidos (S6, A10)', () => {
  const AHORA = new Date('2026-10-23T18:37:00-07:00')

  function renderizarMisPedidos(modelos: ModelosVenta, ruta = '/mis-pedidos') {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <SesionProvider sesion={sesion}>
          <Routes><Route path="/mis-pedidos" element={<MisPedidos modelos={modelos} />} /></Routes>
          <Ubicacion />
        </SesionProvider>
      </MemoryRouter>
    )
  }

  it('lista los pedidos, abre el del enlace y sube el comprobante: pasa a «Pago en revisión»', async () => {
    const gateway = gatewayFalso()
    renderizarMisPedidos(crearModelosVenta(gateway, () => AHORA), '/mis-pedidos?folio=FLY-000131')
    expect(await screen.findByRole('heading', { name: 'FLY-000131' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /FLY-000/ })).toHaveLength(3)
    expect(screen.getByText('Sube tu comprobante antes de')).toBeInTheDocument()
    expect(await screen.findByText('722 969 0101 2345 6789')).toBeInTheDocument()
    expect(gateway.obtenerDatosBancariosPedidoVenta).toHaveBeenCalledWith('FLY-000131')
    expect(gateway.obtenerDatosBancarios).not.toHaveBeenCalled()

    // jsdom no implementa la vista previa del archivo.
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:vista-previa'), writable: true, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true, configurable: true })
    const archivo = new File(['imagen'], 'comprobante.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText(/Subir comprobante/), archivo)
    await userEvent.click(screen.getByRole('button', { name: /Enviar comprobante/ }))
    expect(gateway.subirComprobantePedidoVenta).toHaveBeenCalledWith('FLY-000131', archivo)
    expect(await screen.findByText('Recibimos tu comprobante')).toBeInTheDocument()
    expect(screen.queryByText('Sube tu comprobante antes de')).not.toBeInTheDocument()
  })

  it('muestra el pedido vencido como «Cancelado por vencimiento» con sus acciones (A10)', async () => {
    renderizarMisPedidos(crearModelosVenta(gatewayFalso(), () => AHORA))
    await userEvent.click(await screen.findByRole('button', { name: /FLY-000097/ }))
    expect(screen.getByRole('heading', { name: 'FLY-000097' })).toBeInTheDocument()
    expect(screen.getByText('Este pedido se canceló por vencimiento')).toBeInTheDocument()
    expect(screen.getByText('El plazo venció el')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hacer un nuevo pedido/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Escribir por WhatsApp/ })).toHaveAttribute('href', expect.stringContaining('wa.me'))
    expect(screen.getByTestId('ruta').textContent).toBe('/mis-pedidos')
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
  })

  it('el cliente cancela su pedido pendiente de comprobante con un motivo opcional', async () => {
    const gateway = gatewayFalso()
    renderizarMisPedidos(crearModelosVenta(gateway, () => AHORA), '/mis-pedidos?folio=FLY-000131')
    await screen.findByRole('heading', { name: 'FLY-000131' })

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    const dialogo = within(screen.getByRole('dialog'))
    expect(dialogo.getByText('¿Cancelar el pedido FLY-000131?')).toBeInTheDocument()
    expect(dialogo.getByText(/Ya no podrás subir tu comprobante/)).toBeInTheDocument()
    await userEvent.type(dialogo.getByLabelText('Motivo (opcional)'), 'Ya no lo necesito')
    await userEvent.click(dialogo.getByRole('button', { name: 'Cancelar pedido' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(gateway.cancelarPedidoVenta).toHaveBeenCalledWith('FLY-000131', 'Ya no lo necesito')
    expect(screen.getByText('Cancelaste tu pedido')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByText('Sube tu comprobante antes de')).not.toBeInTheDocument()
  })

  it('«Volver» cierra el diálogo sin cancelar y un pedido en revisión ya no se cancela', async () => {
    const gateway = gatewayFalso()
    renderizarMisPedidos(crearModelosVenta(gateway, () => AHORA), '/mis-pedidos?folio=FLY-000131')
    await screen.findByRole('heading', { name: 'FLY-000131' })

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Volver' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(gateway.cancelarPedidoVenta).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /FLY-000128/ }))
    expect(screen.getByRole('heading', { name: 'FLY-000128' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
  })
})
