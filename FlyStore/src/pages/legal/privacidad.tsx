import { useNavigate } from 'react-router-dom'
import './legal.css'

export function PrivacidadPage() {
  const navigate = useNavigate()

  return (
    <div className="legal-root">

      {/* Top bar */}
      <div className="legal-topbar">
        <button className="legal-back" onClick={() => navigate(-1)} aria-label="Volver">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 2L4 7l5 5" />
          </svg>
          Volver
        </button>
        <img src="/logos/fly-logo.png" alt="FLY Store" className="legal-topbar-logo" />
      </div>

      {/* Hero */}
      <div className="legal-hero">
        <span className="legal-badge">Legal</span>
        <h1 className="legal-title">Aviso de Privacidad</h1>
        <p className="legal-updated">Última actualización: julio de 2025</p>
      </div>

      {/* Content */}
      <div className="legal-content">

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">01</span>
            Responsable del tratamiento
          </h2>
          <p>
            <strong style={{ color: '#fff', fontWeight: 600 }}>FLY Store</strong>, con domicilio en Ciudad Obregón,
            Sonora, México, es el responsable del tratamiento de los datos personales que nos proporciones
            a través de nuestro sitio web <a href="https://flystore.mx" className="legal-link">flystore.mx</a> y
            de cualquier canal de contacto habilitado.
          </p>
          <p>
            Para cualquier consulta relacionada con tus datos personales puedes escribirnos a{' '}
            <a href="mailto:contacto@flystore.mx" className="legal-link">contacto@flystore.mx</a>.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">02</span>
            Datos que recopilamos
          </h2>
          <p>Al crear una cuenta o realizar una compra podemos recopilar los siguientes datos personales:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío</li>
            <li>Historial de pedidos y favoritos</li>
          </ul>
          <p>
            Adicionalmente, al navegar por nuestro sitio podemos recopilar datos técnicos como tu dirección IP,
            tipo de dispositivo, navegador y páginas visitadas, con fines estadísticos y de mejora del servicio.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">03</span>
            Finalidad del tratamiento
          </h2>
          <p>Utilizamos tus datos personales para las siguientes finalidades:</p>
          <ul>
            <li>Gestionar tu cuenta y autenticación en la plataforma</li>
            <li>Procesar y dar seguimiento a tus pedidos</li>
            <li>Enviarte confirmaciones, actualizaciones de envío y notificaciones de cuenta</li>
            <li>Brindarte atención al cliente y resolver dudas o reclamaciones</li>
            <li>Mejorar nuestros productos, servicios y experiencia de usuario</li>
            <li>Cumplir con obligaciones legales y fiscales aplicables</li>
          </ul>
          <p>
            Con tu consentimiento expreso, también podríamos enviarte comunicaciones comerciales sobre
            nuevas colecciones, promociones exclusivas y novedades de FLY Store.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">04</span>
            Base legal del tratamiento
          </h2>
          <p>
            El tratamiento de tus datos se sustenta en las siguientes bases legales conforme a la
            Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP):
          </p>
          <ul>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Consentimiento</strong> — para el envío de comunicaciones comerciales y uso de cookies no esenciales</li>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Ejecución de contrato</strong> — para gestionar tu cuenta y procesar pedidos</li>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Obligación legal</strong> — para cumplir con requisitos fiscales y legales aplicables</li>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Interés legítimo</strong> — para prevenir fraudes y garantizar la seguridad de la plataforma</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">05</span>
            Transferencia de datos a terceros
          </h2>
          <p>
            No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Podemos
            compartirlos únicamente con proveedores de servicios que actúan en nuestro nombre bajo
            estrictas obligaciones de confidencialidad, entre ellos:
          </p>
          <ul>
            <li>Supabase — plataforma de base de datos y autenticación (servidores en EE.UU.)</li>
            <li>Proveedores de pago (cuando esté habilitado el proceso de compra)</li>
            <li>Servicios de mensajería y logística para entrega de pedidos</li>
          </ul>
          <p>
            Cualquier transferencia internacional de datos se realiza con las salvaguardas adecuadas
            y conforme a la normativa vigente.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">06</span>
            Cookies y tecnologías similares
          </h2>
          <p>
            Nuestro sitio puede utilizar cookies técnicas necesarias para el funcionamiento de la
            plataforma (sesión de usuario, preferencias). No utilizamos cookies de rastreo publicitario
            de terceros sin tu consentimiento previo.
          </p>
          <p>
            Puedes configurar tu navegador para rechazar o eliminar cookies; sin embargo, algunas
            funcionalidades del sitio podrían verse afectadas.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">07</span>
            Tus derechos (ARCO)
          </h2>
          <p>
            Conforme a la LFPDPPP tienes derecho a:
          </p>
          <ul>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Acceso</strong> — conocer qué datos personales tenemos de ti y cómo los usamos</li>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Rectificación</strong> — corregir datos inexactos o incompletos</li>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Cancelación</strong> — solicitar la eliminación de tus datos cuando ya no sean necesarios</li>
            <li><strong style={{ color: '#fff', fontWeight: 500 }}>Oposición</strong> — oponerte al tratamiento de tus datos para determinadas finalidades</li>
          </ul>
          <div className="legal-highlight">
            <p>
              Para ejercer tus derechos ARCO envíanos un correo a{' '}
              <a href="mailto:contacto@flystore.mx" className="legal-link">contacto@flystore.mx</a> indicando
              tu nombre completo, correo de registro y el derecho que deseas ejercer. Responderemos en un
              plazo máximo de 20 días hábiles.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">08</span>
            Conservación de datos
          </h2>
          <p>
            Conservamos tus datos personales durante el tiempo necesario para cumplir las finalidades
            descritas en este aviso, y en todo caso durante los plazos que exija la legislación fiscal
            y mercantil aplicable (generalmente 5 años).
          </p>
          <p>
            Una vez vencido el período de conservación, procederemos a eliminar o anonimizar los datos
            de forma segura.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">09</span>
            Cambios a este aviso
          </h2>
          <p>
            FLY Store se reserva el derecho de actualizar este Aviso de Privacidad en cualquier momento.
            Los cambios entrarán en vigor a partir de su publicación en{' '}
            <a href="https://flystore.mx/privacidad" className="legal-link">flystore.mx/privacidad</a>.
            Te recomendamos revisarlo periódicamente. Si los cambios son significativos, te lo notificaremos
            por correo electrónico.
          </p>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <img src="/logos/fly-logo.png" alt="FLY Store" className="legal-footer-logo" />
          <p className="legal-footer-text">FLY Store · Ciudad Obregón, Sonora · flystore.mx</p>
        </div>

      </div>
    </div>
  )
}
