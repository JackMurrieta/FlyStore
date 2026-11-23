/**
 * useMisPedidos · ViewModel de MisPedidosView (S6 y A10).
 * Carga los pedidos registrados al montar, conserva el pedido elegido en la URL (?folio=) para
 * que el enlace desde B7 y la recarga abran el mismo, maneja el archivo del comprobante y el
 * diálogo para que el cliente cancele su pedido antes de pagar.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EstadoVenta } from '../../dominio/EstadoVenta'
import { useModelosVenta } from '../ModelosVentaContext'

export function useMisPedidos() {
  const { modelos } = useModelosVenta()
  const modelo = modelos.pedidos
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const [parametros, setParametros] = useSearchParams()
  const [folioInicial] = useState(() => parametros.get('folio'))
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [dialogoCancelar, setDialogoCancelar] = useState(false)

  useEffect(() => {
    if (modelo.obtenerEstado().cargando) return
    void modelo.listarPedidosVenta(folioInicial)
  }, [modelo, folioInicial])

  const vistaPreviaUrl = useMemo(
    () => (archivo && archivo.type.startsWith('image/') ? URL.createObjectURL(archivo) : null),
    [archivo]
  )
  useEffect(() => () => {
    if (vistaPreviaUrl) URL.revokeObjectURL(vistaPreviaUrl)
  }, [vistaPreviaUrl])

  const seleccionado = estado.pedidos?.find((pedido) => pedido.folio === estado.folioSeleccionado) ?? null
  const vencido = seleccionado ? modelo.plazoVencido(seleccionado) : false
  const puedeSubir = seleccionado ? modelo.puedeSubirComprobante(seleccionado) : false
  const puedeCancelar = seleccionado ? modelo.puedeCancelar(seleccionado) : false

  /** El cliente elige otro pedido: se descarta el archivo elegido y se guarda el folio en la URL. */
  const seleccionarPedido = (folio: string) => {
    setArchivo(null)
    setErrorArchivo(null)
    modelo.seleccionarPedido(folio)
    setParametros({ folio }, { replace: true })
  }

  const seleccionarArchivo = (nuevo: File | null) => {
    setArchivo(nuevo)
    setErrorArchivo(nuevo ? modelo.validarArchivoComprobante(nuevo) : null)
    modelo.limpiarErrorComprobante()
  }

  /** «Enviar comprobante»: al recibirlo, el pedido pasa a «Pago en revisión». */
  const enviarComprobante = async () => {
    if (!seleccionado?.folio || !archivo || errorArchivo) return
    const actualizado = await modelo.subirComprobantePedidoVenta(seleccionado.folio, archivo)
    if (actualizado) setArchivo(null)
  }

  const errorServidor = estado.errorComprobante

  const abrirCancelar = () => {
    modelo.limpiarErrorCancelacion()
    setDialogoCancelar(true)
  }

  const cerrarCancelar = () => {
    setDialogoCancelar(false)
    modelo.limpiarErrorCancelacion()
  }

  /** «Cancelar pedido» del diálogo: si el backend lo cancela, el diálogo se cierra. */
  const cancelarPedido = async (motivo: string) => {
    if (!seleccionado?.folio) return
    const cancelado = await modelo.cancelarPedidoVenta(seleccionado.folio, motivo)
    if (cancelado) setDialogoCancelar(false)
  }

  return {
    cargando: estado.cargando && estado.pedidos === null,
    error: estado.error,
    pedidos: estado.pedidos ?? [],
    cargado: estado.pedidos !== null,
    seleccionado,
    seleccionarPedido,
    reintentar: () => void modelo.listarPedidosVenta(estado.folioSeleccionado ?? folioInicial),

    vencido,
    puedeSubir,
    estadoMostrado: modelo.estadoMostrado,
    esperaEfectivo: seleccionado?.estado?.valor === EstadoVenta.APARTADO_PENDIENTE_PAGO && !vencido,
    horasRestantes: seleccionado ? modelo.horasRestantesPago(seleccionado) : null,

    datosBancarios: estado.datosBancarios,
    cargandoDatosBancarios: estado.cargandoDatosBancarios,
    errorDatosBancarios: estado.errorDatosBancarios,
    reintentarDatosBancarios: () => {
      if (seleccionado?.folio) void modelo.obtenerDatosBancariosPedidoVenta(seleccionado.folio)
    },

    archivo,
    vistaPreviaUrl,
    esPdf: Boolean(archivo && (archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf'))),
    archivoValidoLocal: Boolean(archivo) && !errorArchivo,
    /** Primero el error del front (formato/tamaño), luego el del backend o de conexión. */
    mensajeError: errorArchivo ?? errorServidor?.mensaje ?? null,
    errorDeConexion: !errorArchivo && errorServidor?.tipo === 'red',
    subiendo: estado.subiendoComprobante,
    comprobanteRecibido: Boolean(seleccionado?.folio) && estado.comprobanteRecibido === seleccionado?.folio,
    seleccionarArchivo,
    enviarComprobante,

    puedeCancelar,
    dialogoCancelarAbierto: dialogoCancelar && Boolean(seleccionado?.folio),
    abrirCancelar,
    cerrarCancelar,
    cancelarPedido,
    cancelando: estado.cancelando,
    errorCancelacion: estado.errorCancelacion,
    pedidoCancelado: Boolean(seleccionado?.folio) && estado.pedidoCancelado === seleccionado?.folio,
  }
}
