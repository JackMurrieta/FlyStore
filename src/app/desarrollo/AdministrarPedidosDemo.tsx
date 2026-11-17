import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { useSesion } from '@compartido/sesion'
import { Boton } from '@compartido/ui'
import { configurarBackendPedidosDemo, instalarBackendPedidosDemo, reiniciarBackendPedidosDemo } from './backendPedidosDemo'
import estilos from './AdministrarPedidosDemo.module.css'

/**
 * Entrada al modo de prueba del CU-04 (solo desarrollo).
 * Instala el backend en memoria y abre una sesión de administrador de prueba,
 * para recorrer /admin/pedidos sin Spring Boot.
 */
export default function AdministrarPedidosDemo() {
  const navegar = useNavigate()
  const { estado } = useSesion()
  const [sinWhatsApp, setSinWhatsApp] = useState(false)

  useEffect(() => {
    instalarBackendPedidosDemo()
  }, [])

  // Se espera a que termine la verificación inicial de sesión para que no pise la sesión de prueba.
  useEffect(() => {
    if (estado !== 'anonimo') return
    contenedor.sesionModel.establecerUsuarioAutenticado({
      userId: '1', email: 'demo@flystore.test', nombre: 'Administrador', apellidos: 'de prueba', tipoUsuario: 'ADMIN',
    })
  }, [estado])

  const entrar = () => {
    configurarBackendPedidosDemo({ notificacionDisponible: !sinWhatsApp })
    navegar('/admin/pedidos')
  }

  return (
    <main className={estilos.pagina}>
      <section className={estilos.tarjeta}>
        <p className={estilos.etiqueta}>Modo de prueba · Administrar pedidos</p>
        <h1 className={estilos.titulo}>CU-04 con datos en memoria</h1>
        <p className={estilos.texto}>
          Sin backend. Hay nueve pedidos de ejemplo en distintos estados; los cambios se pierden al recargar la página.
        </p>
        <ul className={estilos.lista}>
          <li><strong>FLY-000128</strong> y <strong>FLY-000131</strong>: pago en revisión, para aprobar o rechazar el comprobante.</li>
          <li><strong>FLY-000127</strong>: apartado vigente, para registrar pago en efectivo.</li>
          <li><strong>FLY-000120</strong>: apartado vencido.</li>
          <li><strong>FLY-000119</strong>: pagado, para marcar como enviado y luego entregado.</li>
          <li><strong>FLY-000112</strong>: enviado, ya no se puede cancelar.</li>
          <li><strong>FLY-000101</strong>: pendiente de comprobante, se puede cancelar.</li>
        </ul>
        <label className={estilos.opcion}>
          <input type="checkbox" checked={sinWhatsApp} onChange={(evento) => setSinWhatsApp(evento.target.checked)} />
          Simular que el aviso por WhatsApp falla (aparece «Notificar por WhatsApp»)
        </label>
        <div className={estilos.acciones}>
          <Boton onClick={entrar} disabled={estado !== 'autenticado'}>
            {estado === 'autenticado' ? 'Entrar a Pedidos' : 'Preparando sesión de prueba…'}
          </Boton>
          <Boton variante="secundario" onClick={reiniciarBackendPedidosDemo}>Reiniciar datos</Boton>
        </div>
        <p className={estilos.nota}>Si recargas dentro de /admin/pedidos, vuelve a entrar por esta página.</p>
      </section>
    </main>
  )
}
