/**
 * /terminos · Términos y condiciones de uso y compra de FlyStore.
 * Reflejan las reglas del negocio implementadas (precios por volumen, códigos de descuento,
 * pago sin cobro en línea, plazo de 42 h, descuento de existencia al pagar y entrega por WhatsApp).
 * Revísalos con quien asesore legalmente al negocio antes de publicarlos.
 */

import { Link } from 'react-router-dom'
import { MARCA, RUTAS_AYUDA } from '@compartido/config/marca'
import { PaginaInformativa, type SeccionInformativa } from './PaginaInformativa'

const correo = <a href={`mailto:${MARCA.correoContacto}`}>{MARCA.correoContacto}</a>

const SECCIONES: readonly SeccionInformativa[] = [
  {
    id: 'aceptacion',
    titulo: 'Aceptación',
    contenido: (
      <>
        <p>
          Estos términos regulan el uso de {MARCA.sitio} y las compras que hagas en la tienda de {MARCA.nombreComercial}
          {' '}(«FlyStore»), con domicilio en {MARCA.ciudad}. Al crear una cuenta o hacer un pedido, aceptas estos términos y
          nuestro <Link to={RUTAS_AYUDA.privacidad}>Aviso de privacidad</Link>.
        </p>
        <p>Si tienes dudas, escríbenos a {correo}.</p>
      </>
    ),
  },
  {
    id: 'cuenta',
    titulo: 'Tu cuenta',
    contenido: (
      <ul>
        <li>Para comprar necesitas una cuenta, que puedes crear con tu correo y contraseña o con Google.</li>
        <li>Debes darnos datos verdaderos y mantenerlos al día; puedes editarlos en <Link to="/perfil">Mi perfil</Link>.</li>
        <li>
          Eres responsable de lo que se haga con tu cuenta. Cuida tu contraseña y, si crees que alguien más la usa, cámbiala y
          cierra la sesión en todos tus dispositivos desde <Link to="/perfil/seguridad">Mi perfil · Seguridad</Link>.
        </li>
        <li>Podemos suspender cuentas que se usen para fraude, suplantación o para afectar la tienda o a otros clientes.</li>
      </ul>
    ),
  },
  {
    id: 'productos',
    titulo: 'Productos y disponibilidad',
    contenido: (
      <>
        <p>
          Nuestro catálogo es una selección propia de productos de distintos proveedores, con existencias limitadas. Las fotos
          muestran el producto, pero el color puede verse distinto según tu pantalla.
        </p>
        <p>
          Las marcas de los productos pertenecen a sus respectivos titulares. FlyStore es un comercio independiente y no está
          afiliado a esas marcas, salvo que se indique lo contrario.
        </p>
      </>
    ),
  },
  {
    id: 'precios',
    titulo: 'Precios, precios por volumen y códigos de descuento',
    contenido: (
      <ul>
        <li>Los precios se muestran en pesos mexicanos (MXN).</li>
        <li>
          Cada producto puede tener precios por volumen (por ejemplo, Base, Mayoreo o Distribuidor). El precio se calcula por
          producto, según el total de piezas que lleves de ese producto en tu pedido, sin importar talla o color.
        </li>
        <li>
          Los códigos de descuento se escriben en el carrito y se aplican al producto al que corresponden, como un monto fijo por
          pieza. Tienen vigencia y pueden dejar de ser válidos; si vencen antes de que registres tu pedido, se quitan.
        </li>
        <li>
          El total que confirmas al registrar tu pedido es el que pagas. Si los precios cambian mientras compras, te pediremos
          revisar tu pedido antes de registrarlo.
        </li>
        <li>Si tu entrega tiene costo de envío, te lo informaremos antes de que pagues.</li>
      </ul>
    ),
  },
  {
    id: 'pedidos',
    titulo: 'Cómo funciona un pedido',
    contenido: (
      <ol>
        <li>Agregas productos a tu carrito; el carrito se guarda en tu cuenta.</li>
        <li>Indicas tus datos de entrega y eliges cómo pagar: transferencia o efectivo.</li>
        <li>Confirmas el pedido y recibes un <strong>folio</strong> y un ticket que puedes imprimir o guardar como PDF.</li>
        <li>Registrar un pedido <strong>no aparta</strong> los productos: la existencia se descuenta cuando confirmamos tu pago.</li>
        <li>
          Los pagos se validan en el orden en que llegan. Si al confirmar tu pago ya no hay suficientes piezas, te avisaremos
          para que ajustes tu pedido.
        </li>
      </ol>
    ),
  },
  {
    id: 'pagos',
    titulo: 'Pagos y plazo de 42 horas',
    contenido: (
      <>
        <ul>
          <li><strong>La plataforma no cobra en línea</strong> ni guarda datos de tarjetas.</li>
          <li>
            <strong>Transferencia:</strong> transfiere el total exacto con tu folio como concepto y sube tu comprobante al hacer el
            pedido o después, desde <Link to="/mis-pedidos">Mis pedidos</Link>. Revisaremos que el monto, la fecha y el concepto
            coincidan.
          </li>
          <li><strong>Efectivo:</strong> te escribiremos por WhatsApp para acordar el pago y la entrega.</li>
          <li>
            Tienes <strong>42 horas</strong> desde que registras tu pedido para pagarlo o subir tu comprobante. Si el plazo vence,
            el pedido se cancela por vencimiento y, para comprar, tendrás que hacer uno nuevo.
          </li>
          <li>
            Si tu comprobante no es válido o no podemos confirmarlo, te contactaremos por WhatsApp o correo para resolverlo.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'entregas',
    titulo: 'Entregas',
    contenido: (
      <p>
        Una vez confirmado el pago, coordinamos contigo la entrega o el envío por WhatsApp, usando los datos de entrega de tu
        pedido. Revisa que tu dirección y teléfono sean correctos: si no podemos contactarte, la entrega puede retrasarse.
      </p>
    ),
  },
  {
    id: 'cancelaciones',
    titulo: 'Cancelaciones, cambios y devoluciones',
    contenido: (
      <>
        <p>
          Antes de pagar puedes dejar que tu pedido venza o escribirnos para cancelarlo. Si tu producto llega dañado o no es el
          que pediste, escríbenos a {correo} o por WhatsApp con tu folio y fotos del producto, y revisaremos tu caso.
        </p>
        <p>Esto no limita los derechos que te otorga la Ley Federal de Protección al Consumidor.</p>
      </>
    ),
  },
  {
    id: 'uso',
    titulo: 'Uso adecuado del sitio',
    contenido: (
      <p>
        No está permitido usar el sitio para actividades ilícitas, intentar acceder a cuentas ajenas, subir archivos con virus o
        comprobantes falsos, ni copiar el contenido del sitio para fines comerciales sin autorización.
      </p>
    ),
  },
  {
    id: 'responsabilidad',
    titulo: 'Disponibilidad del servicio',
    contenido: (
      <p>
        Hacemos lo posible para que la tienda funcione sin interrupciones, pero puede haber pausas por mantenimiento o fallas de
        nuestros proveedores. En ese caso, los plazos de tus pedidos se revisarán caso por caso.
      </p>
    ),
  },
  {
    id: 'cambios',
    titulo: 'Cambios a estos términos y ley aplicable',
    contenido: (
      <>
        <p>
          Podemos actualizar estos términos; la versión vigente siempre estará en esta página con su fecha. Los pedidos ya
          registrados se rigen por los términos vigentes cuando los hiciste.
        </p>
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, puedes acudir a la
          Procuraduría Federal del Consumidor (PROFECO) o a los tribunales competentes de Ciudad Obregón, Sonora.
        </p>
      </>
    ),
  },
]

export default function TerminosVista() {
  return (
    <PaginaInformativa
      sobretitulo="Legal"
      titulo="Términos y condiciones"
      actualizado="21 de noviembre de 2026"
      introduccion={<p>Las reglas para usar {MARCA.sitio} y comprar en FlyStore, explicadas de forma clara.</p>}
      secciones={SECCIONES}
    />
  )
}
