import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SesionProvider, type EstadoSesionTs, type ISesion } from '@compartido/sesion'
import { crearModelosVenta, type ModelosVenta } from '../../aplicacion/ModelosVenta'
import { gatewayFalso, pedidoFigma } from '../../pruebas/fixturesVenta'
import { GestionarVenta } from '../GestionarVenta'
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
          <ModelosVentaContext.Provider value={{ modelos, rutaBase: '/carrito' }}>
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
})
