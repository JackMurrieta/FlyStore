/**
 * /preguntas-frecuentes · Dudas comunes sobre comprar en FlyStore.
 * Respuestas basadas en las reglas del negocio implementadas en CU-02 Gestionar venta.
 * Acordeón con <details>/<summary>: accesible con teclado y lector de pantalla sin JavaScript extra.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MARCA, RUTAS_AYUDA } from '@compartido/config/marca'
import { PaginaInformativa, type SeccionInformativa } from './PaginaInformativa'
import estilos from './informacion.module.css'

interface Pregunta {
  readonly pregunta: string
  readonly respuesta: ReactNode
}

function Preguntas({ lista }: { readonly lista: readonly Pregunta[] }) {
  return (
    <div className={estilos.preguntas}>
      {lista.map((item) => (
        <details key={item.pregunta} className={estilos.pregunta}>
          <summary>{item.pregunta}</summary>
          <div className={estilos.respuesta}>{item.respuesta}</div>
        </details>
      ))}
    </div>
  )
}

const correo = <a href={`mailto:${MARCA.correoContacto}`}>{MARCA.correoContacto}</a>

const COMPRAS: readonly Pregunta[] = [
  {
    pregunta: '¿Cómo hago un pedido?',
    respuesta: (
      <ol>
        <li>Agrega productos a tu carrito (necesitas iniciar sesión).</li>
        <li>Revisa cantidades y, si tienes, aplica tu código de descuento.</li>
        <li>Escribe tus datos de entrega y elige transferencia o efectivo.</li>
        <li>Confirma tu pedido: recibirás un folio y un ticket que puedes imprimir o guardar como PDF.</li>
      </ol>
    ),
  },
  {
    pregunta: '¿Necesito una cuenta para comprar?',
    respuesta: (
      <p>
        Sí. Puedes crearla con tu correo o entrar con Google en segundos. Tu carrito se guarda en tu cuenta, así que puedes
        seguir tu compra desde otro dispositivo.
      </p>
    ),
  },
  {
    pregunta: 'Agregué productos y ahora no hay existencia, ¿qué pasa?',
    respuesta: (
      <p>
        Registrar un pedido no aparta los productos: la existencia se descuenta cuando confirmamos tu pago, en el orden en que
        llegan los pagos. Si al confirmar el tuyo ya no alcanzan las piezas, te avisaremos para que ajustes tu pedido.
      </p>
    ),
  },
]

const PRECIOS: readonly Pregunta[] = [
  {
    pregunta: '¿Cómo funcionan los precios por volumen (Base, Mayoreo, Distribuidor…)?',
    respuesta: (
      <>
        <p>
          Cada producto tiene precios según las piezas que lleves <strong>de ese producto</strong>, sin importar la talla o el
          color. Por ejemplo, si un producto tiene precio de Mayoreo desde 6 piezas, al llevar 6 o más de ese producto todas se
          cobran a ese precio.
        </p>
        <p>En el carrito verás cuántas piezas te faltan para el siguiente precio.</p>
      </>
    ),
  },
  {
    pregunta: 'Mi carrito dice «Mixto», ¿qué significa?',
    respuesta: (
      <p>
        Que tus productos quedaron en precios distintos: por ejemplo, uno a precio de Mayoreo y otro a precio Base. Cada uno se
        cobra según sus propias piezas.
      </p>
    ),
  },
  {
    pregunta: '¿Cómo uso un código de descuento?',
    respuesta: (
      <p>
        Escríbelo en el carrito y pulsa «Aplicar». El código descuenta un monto fijo por pieza del producto al que aplica. Si no
        existe, ya venció o no aplica a ningún producto de tu carrito, te lo diremos en ese momento.
      </p>
    ),
  },
]

const PAGOS: readonly Pregunta[] = [
  {
    pregunta: '¿Qué formas de pago aceptan?',
    respuesta: (
      <p>
        Transferencia bancaria o efectivo. La tienda <strong>no cobra en línea</strong> ni te pedirá datos de tarjeta.
      </p>
    ),
  },
  {
    pregunta: '¿Cuánto tiempo tengo para pagar?',
    respuesta: (
      <p>
        <strong>42 horas</strong> desde que registras tu pedido. Si en ese plazo no pagas (o no subes tu comprobante), el pedido
        se cancela por vencimiento y tendrás que hacer uno nuevo.
      </p>
    ),
  },
  {
    pregunta: '¿Cómo pago por transferencia?',
    respuesta: (
      <ol>
        <li>Transfiere el <strong>monto exacto</strong> a la cuenta que te mostramos.</li>
        <li>Escribe tu <strong>folio</strong> como concepto de la transferencia.</li>
        <li>Sube tu comprobante (JPG, PNG o PDF de máximo 5 MB) al confirmar el pedido o después, desde Mis pedidos.</li>
      </ol>
    ),
  },
  {
    pregunta: 'Ya pagué pero no subí mi comprobante, ¿dónde lo subo?',
    respuesta: (
      <p>
        En <Link to="/mis-pedidos">Mis pedidos</Link>: elige el pedido «Pendiente de comprobante», revisa los datos para
        transferir y sube el archivo antes de que venza el plazo. El pedido pasará a «Pago en revisión».
      </p>
    ),
  },
  {
    pregunta: '¿Cómo pago en efectivo?',
    respuesta: <p>Al registrar tu pedido te escribiremos por WhatsApp para acordar dónde y cuándo pagar y recibir tus productos.</p>,
  },
]

const PEDIDOS: readonly Pregunta[] = [
  {
    pregunta: '¿Qué significa cada estado de mi pedido?',
    respuesta: (
      <ul>
        <li><strong>Pendiente de comprobante:</strong> falta que subas tu comprobante de transferencia.</li>
        <li><strong>Pendiente de pago:</strong> elegiste efectivo y falta pagar.</li>
        <li><strong>Pago en revisión:</strong> recibimos tu comprobante y lo estamos validando.</li>
        <li><strong>Pagado:</strong> confirmamos tu pago.</li>
        <li><strong>En preparación, Enviado y Entregado:</strong> el avance de tu entrega.</li>
        <li><strong>Cancelado por vencimiento:</strong> pasaron las 42 horas sin pago.</li>
      </ul>
    ),
  },
  {
    pregunta: '¿Cómo recibo mi pedido?',
    respuesta: (
      <p>
        Con tu pago confirmado coordinamos contigo la entrega o el envío por WhatsApp, con los datos de entrega de tu pedido.
      </p>
    ),
  },
  {
    pregunta: '¿Dónde veo mi recibo?',
    respuesta: (
      <p>
        Al confirmar tu pedido verás tu recibo y el botón «Descargar recibo», que lo guarda como imagen. También puedes
        descargarlo cuando quieras desde «Mis pedidos» con «Ver recibo».
      </p>
    ),
  },
  {
    pregunta: 'Mi producto llegó dañado o no es el que pedí',
    respuesta: <p>Escríbenos a {correo} o por WhatsApp con tu folio y fotos del producto, y revisaremos tu caso.</p>,
  },
]

const CUENTA: readonly Pregunta[] = [
  {
    pregunta: '¿Cómo cambio mi nombre, teléfono o direcciones?',
    respuesta: (
      <p>
        En <Link to="/perfil">Mi perfil</Link>. En «Direcciones» puedes elegir cuál se propone al comprar (predeterminada),
        quitarla o eliminar las que ya no uses.
      </p>
    ),
  },
  {
    pregunta: 'Olvidé mi contraseña',
    respuesta: (
      <p>
        En «Iniciar sesión» elige <Link to="/recuperar-contrasena">«¿Olvidaste tu contraseña?»</Link> y te enviaremos un enlace
        para crear una nueva. Si entras con Google, tu cuenta no usa contraseña de FlyStore.
      </p>
    ),
  },
  {
    pregunta: '¿Cómo cambio mi correo?',
    respuesta: (
      <p>
        En <Link to="/perfil/seguridad">Mi perfil · Seguridad</Link>. Te enviaremos un enlace al correo nuevo y el cambio se
        aplicará cuando lo confirmes. Si entras con Google, tu correo es el de tu cuenta de Google.
      </p>
    ),
  },
  {
    pregunta: '¿Qué hacen con mis datos?',
    respuesta: (
      <p>
        Solo los usamos para tu cuenta, tus pedidos y tus entregas; no los vendemos ni los usamos para publicidad. Consulta el{' '}
        <Link to={RUTAS_AYUDA.privacidad}>Aviso de privacidad</Link>.
      </p>
    ),
  },
]

const SECCIONES: readonly SeccionInformativa[] = [
  { id: 'compras', titulo: 'Compras', contenido: <Preguntas lista={COMPRAS} /> },
  { id: 'precios', titulo: 'Precios y descuentos', contenido: <Preguntas lista={PRECIOS} /> },
  { id: 'pagos', titulo: 'Pagos', contenido: <Preguntas lista={PAGOS} /> },
  { id: 'pedidos', titulo: 'Pedidos y entregas', contenido: <Preguntas lista={PEDIDOS} /> },
  { id: 'cuenta', titulo: 'Tu cuenta', contenido: <Preguntas lista={CUENTA} /> },
  {
    id: 'contacto',
    titulo: '¿No encontraste tu respuesta?',
    contenido: <p>Escríbenos a {correo} y te respondemos lo antes posible.</p>,
  },
]

export default function PreguntasFrecuentesVista() {
  return (
    <PaginaInformativa
      sobretitulo="Ayuda"
      titulo="Preguntas frecuentes"
      introduccion={<p>Todo lo que necesitas saber para comprar en FlyStore: precios, pagos, pedidos y tu cuenta.</p>}
      secciones={SECCIONES}
    />
  )
}
