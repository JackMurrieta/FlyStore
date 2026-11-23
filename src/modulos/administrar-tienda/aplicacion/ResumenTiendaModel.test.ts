import { describe, expect, it, vi } from 'vitest'
import { ResumenTiendaModel, TOPE_CONTEO } from './ResumenTiendaModel'
import type { IResumenTiendaGateway } from '../dominio/puertos/IResumenTiendaGateway'

const gateway = (): IResumenTiendaGateway => ({
  obtenerPagosPorConfirmar: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
  obtenerProductosPorEstado: vi.fn(async estado => estado === 'BORRADOR'
    ? { productos: Array.from({ length: TOPE_CONTEO }), hayMas: true }
    : { productos: [{}], hayMas: false }),
})

describe('ResumenTiendaModel', () => {
  it('cuenta pagos y productos; con más del tope lo indica', async () => {
    const fuente = gateway()
    const model = new ResumenTiendaModel(fuente)
    await model.cargar()
    expect(model.obtenerEstado()).toMatchObject({ cargando: false, resumen: {
      pagosPorConfirmar: { cantidad: 3, hayMas: false },
      productosBorrador: { cantidad: TOPE_CONTEO, hayMas: true },
      productosStockBajo: { cantidad: 1, hayMas: false },
    } })
    expect(fuente.obtenerProductosPorEstado).toHaveBeenCalledWith('STOCK_BAJO', TOPE_CONTEO)
    expect(model.obtenerEstado().actualizado).toBeInstanceOf(Date)
  })

  it('si un conteo falla, los demás se muestran y ese queda «No disponible» (null)', async () => {
    const fuente = gateway()
    vi.mocked(fuente.obtenerPagosPorConfirmar).mockRejectedValue(new Error('403'))
    const model = new ResumenTiendaModel(fuente)
    await model.cargar()
    expect(model.obtenerEstado().resumen).toMatchObject({ pagosPorConfirmar: null, productosStockBajo: { cantidad: 1 } })
  })

  it('al cerrar sesión descarta las cifras y las respuestas que lleguen después', async () => {
    const fuente = gateway()
    let responder!: (valor: { id: number }[]) => void
    vi.mocked(fuente.obtenerPagosPorConfirmar).mockReturnValue(new Promise(resolve => { responder = resolve }))
    const model = new ResumenTiendaModel(fuente)
    const carga = model.cargar()
    model.reiniciar()
    responder([{ id: 9 }])
    await carga
    expect(model.obtenerEstado()).toEqual({ resumen: null, cargando: false, actualizado: null })
  })
})
