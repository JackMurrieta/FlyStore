/**
 * /privacidad · Aviso de privacidad integral de FlyStore.
 * Contenido mínimo del art. 15 de la LFPDPPP (DOF 20-03-2025): identidad y domicilio del
 * responsable, datos que se tratan, finalidades, opciones para limitar su uso, derechos ARCO
 * y cómo se comunican los cambios. Incluye lo que Google pide para el inicio de sesión con Google.
 * Revísalo con quien asesore legalmente al negocio antes de publicarlo.
 */

import { Link } from 'react-router-dom'
import { MARCA, RUTAS_AYUDA } from '@compartido/config/marca'
import { PaginaInformativa, type SeccionInformativa } from './PaginaInformativa'
import estilos from './informacion.module.css'

const ACTUALIZADO_PRIVACIDAD = '21 de noviembre de 2026'

const correo = <a href={`mailto:${MARCA.correoContacto}`}>{MARCA.correoContacto}</a>

const SECCIONES: readonly SeccionInformativa[] = [
  {
    id: 'responsable',
    titulo: 'Quién es responsable de tus datos',
    contenido: (
      <>
        <p>
          <strong>{MARCA.nombreComercial}</strong> («FlyStore», «nosotros»), tienda en línea de gorras, ropa, perfumes y tenis
          con domicilio en {MARCA.ciudad}, es responsable del tratamiento de los datos personales que nos das al usar{' '}
          {MARCA.sitio}.
        </p>
        <p>Para cualquier tema relacionado con tus datos personales escríbenos a {correo}.</p>
      </>
    ),
  },
  {
    id: 'datos',
    titulo: 'Qué datos recabamos',
    contenido: (
      <>
        <p>Solo pedimos lo necesario para venderte y entregarte tus productos:</p>
        <ul>
          <li><strong>Datos de tu cuenta:</strong> nombre, apellidos, correo electrónico y, si lo agregas, tu teléfono.</li>
          <li>
            <strong>Si entras con Google:</strong> tu nombre, tu correo y el identificador de tu cuenta de Google. No recibimos
            ni guardamos tu contraseña de Google.
          </li>
          <li>
            <strong>Datos de entrega:</strong> nombre de quien recibe, teléfono, ciudad, estado, dirección y referencias. Puedes
            consultarlos, elegir el predeterminado o eliminarlos en <Link to="/perfil/direcciones">Mi perfil</Link>.
          </li>
          <li>
            <strong>Datos de tus pedidos:</strong> productos, cantidades, precios, folio, fechas, estado del pedido y forma de pago
            (transferencia o efectivo).
          </li>
          <li>
            <strong>Comprobante de transferencia:</strong> la imagen o PDF que subes para validar tu pago. Puede mostrar tu nombre,
            el banco, parte de tu número de cuenta, el monto y la fecha.
          </li>
          <li>
            <strong>Datos técnicos de la sesión:</strong> cookies necesarias para mantener tu sesión iniciada (ver «Cookies»).
          </li>
        </ul>
        <p>
          <strong>No recabamos datos personales sensibles</strong> (como salud, origen étnico, creencias u orientación sexual) ni
          datos de tarjetas: la plataforma no cobra en línea.
        </p>
      </>
    ),
  },
  {
    id: 'finalidades',
    titulo: 'Para qué usamos tus datos',
    contenido: (
      <>
        <p>Usamos tus datos para estas finalidades, que son necesarias para el servicio que nos pides:</p>
        <ol>
          <li>Crear y administrar tu cuenta e iniciar tu sesión (con correo y contraseña o con Google).</li>
          <li>Registrar tus pedidos, calcular precios por volumen y aplicar códigos de descuento.</li>
          <li>Validar tus pagos por transferencia o en efectivo y darte seguimiento al pedido.</li>
          <li>Coordinar contigo la entrega o el envío, incluso por WhatsApp si nos escribes o nos das tu teléfono.</li>
          <li>Atender tus dudas, aclaraciones y solicitudes.</li>
          <li>Mantener la seguridad de la tienda y de tu cuenta, y prevenir usos indebidos.</li>
          <li>Cumplir obligaciones legales aplicables.</li>
        </ol>
        <p>
          <strong>No usamos tus datos para publicidad ni los vendemos.</strong> Si en el futuro quisiéramos enviarte promociones,
          te pediremos tu consentimiento antes y podrás negarte en cualquier momento.
        </p>
      </>
    ),
  },
  {
    id: 'google',
    titulo: 'Inicio de sesión con Google',
    contenido: (
      <>
        <p>
          Si eliges «Continuar con Google», Google nos comparte únicamente tu <strong>nombre</strong>, tu{' '}
          <strong>correo electrónico</strong> y tu <strong>imagen de perfil</strong> (permisos básicos <em>openid</em>,{' '}
          <em>email</em> y <em>profile</em>). Los usamos solo para crear tu cuenta, identificarte al iniciar sesión y mostrar tu
          nombre en la tienda. No guardamos tu imagen de perfil.
        </p>
        <p>
          No pedimos acceso a tu Gmail, Drive, contactos ni a ningún otro servicio de Google. No vendemos esta información, no la
          usamos para publicidad y no la compartimos con terceros, salvo con los proveedores que operan la tienda en nuestro
          nombre (ver «Con quién compartimos tus datos»).
        </p>
        <p>
          El uso que FlyStore hace de la información recibida de las API de Google se apega a la{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Política de Datos del Usuario de los Servicios de las API de Google
          </a>
          , incluidos los requisitos de uso limitado. Puedes quitarle el acceso a FlyStore cuando quieras desde{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">la configuración de tu cuenta de Google</a>.
        </p>
      </>
    ),
  },
  {
    id: 'compartir',
    titulo: 'Con quién compartimos tus datos',
    contenido: (
      <>
        <p>
          No transferimos tus datos a terceros para sus propios fines. Para operar la tienda usamos proveedores que los tratan
          por cuenta nuestra y solo para darnos su servicio:
        </p>
        <div className={estilos.tablaScroll}>
          <table>
            <thead>
              <tr><th scope="col">Proveedor</th><th scope="col">Para qué</th></tr>
            </thead>
            <tbody>
              <tr><td>Supabase</td><td>Base de datos, inicio de sesión y almacenamiento privado de comprobantes de pago.</td></tr>
              <tr><td>Railway</td><td>Servidor donde funciona la tienda (backend).</td></tr>
              <tr><td>Cloudflare</td><td>Publicación del sitio, dominio y protección de la conexión.</td></tr>
              <tr><td>Google</td><td>Inicio de sesión con Google, solo si lo eliges.</td></tr>
              <tr><td>WhatsApp (Meta)</td><td>Mensajes para coordinar tu pedido, solo si nos escribes por ese medio.</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Algunos de estos proveedores guardan la información en servidores fuera de México (por ejemplo, en Estados Unidos).
          También podríamos compartir datos si una autoridad competente lo requiere conforme a la ley.
        </p>
      </>
    ),
  },
  {
    id: 'conservacion',
    titulo: 'Cuánto tiempo los guardamos y cómo los protegemos',
    contenido: (
      <>
        <p>
          Conservamos tus datos mientras tengas una cuenta y el tiempo que sea necesario para atender tus pedidos y cumplir
          obligaciones legales. Los pedidos no se borran al vencer: quedan cancelados como parte del historial de ventas.
        </p>
        <p>
          Tu sesión viaja en cookies protegidas (no accesibles desde el navegador), las conexiones están cifradas y los
          comprobantes de pago se guardan en un almacenamiento privado al que solo accede el personal que valida pagos. La
          contraseña la administra el servicio de autenticación y no la guardamos en nuestra base de datos.
        </p>
      </>
    ),
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos ARCO y cómo ejercerlos',
    contenido: (
      <>
        <p>
          Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si son inexactos,{' '}
          <strong>Cancelarlos</strong> y <strong>Oponerte</strong> a su uso. Puedes corregir tu nombre, teléfono, correo y
          direcciones directamente en <Link to="/perfil">Mi perfil</Link>.
        </p>
        <p>Para cualquier otra solicitud (incluido borrar tu cuenta), escríbenos a {correo} con:</p>
        <ul>
          <li>Tu nombre y el correo con el que tienes cuenta en FlyStore.</li>
          <li>Qué derecho quieres ejercer y sobre qué datos.</li>
          <li>Cualquier dato que nos ayude a ubicar tu información (por ejemplo, el folio de un pedido).</li>
        </ul>
        <p>
          Podemos pedirte que confirmes tu identidad desde el correo de tu cuenta. Te responderemos en un máximo de 20 días
          hábiles y, si procede, lo haremos efectivo dentro de los 15 días hábiles siguientes, como marca la ley.
        </p>
      </>
    ),
  },
  {
    id: 'limitar',
    titulo: 'Cómo limitar el uso de tus datos o retirar tu consentimiento',
    contenido: (
      <>
        <p>
          Puedes pedirnos por correo que dejemos de usar tus datos para alguna finalidad o retirar tu consentimiento. Ten en
          cuenta que, si retiras el consentimiento para finalidades necesarias (por ejemplo, para entregarte un pedido), no
          podremos seguir dándote ese servicio.
        </p>
        <p>
          Puedes cerrar tu sesión en todos tus dispositivos desde <Link to="/perfil/seguridad">Mi perfil · Seguridad</Link> y, si
          entras con Google, quitarle el acceso a FlyStore desde{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">tu cuenta de Google</a>.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    titulo: 'Cookies',
    contenido: (
      <>
        <p>
          Usamos solo <strong>cookies necesarias</strong> para que funcione la tienda: las que mantienen tu sesión iniciada y
          una temporal que protege el inicio de sesión con Google. No usamos cookies de publicidad ni de analítica de terceros.
        </p>
        <p>Si las bloqueas en tu navegador no podrás iniciar sesión ni comprar.</p>
      </>
    ),
  },
  {
    id: 'menores',
    titulo: 'Menores de edad',
    contenido: (
      <p>
        FlyStore no está dirigida a menores de 18 años y no recabamos a sabiendas sus datos sin el consentimiento de quien ejerce
        la patria potestad o tutela. Si crees que un menor nos dio sus datos, escríbenos para eliminarlos.
      </p>
    ),
  },
  {
    id: 'cambios',
    titulo: 'Cambios a este aviso',
    contenido: (
      <>
        <p>
          Si cambiamos este aviso lo publicaremos en esta página con su nueva fecha de actualización. Si el cambio es importante
          (por ejemplo, una nueva finalidad que requiera tu consentimiento), también te avisaremos por correo o al iniciar sesión.
        </p>
        <p>
          Si consideras que tu derecho a la protección de datos fue vulnerado, puedes acudir a la autoridad competente en materia
          de protección de datos personales. Consulta también nuestros <Link to={RUTAS_AYUDA.terminos}>Términos y condiciones</Link>.
        </p>
      </>
    ),
  },
]

export default function PrivacidadVista() {
  return (
    <PaginaInformativa
      sobretitulo="Legal"
      titulo="Aviso de privacidad"
      actualizado={ACTUALIZADO_PRIVACIDAD}
      introduccion={
        <p>
          Este aviso explica qué datos personales recabamos en {MARCA.sitio}, para qué los usamos, con quién los compartimos y cómo
          puedes ejercer tus derechos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
        </p>
      }
      secciones={SECCIONES}
    />
  )
}
