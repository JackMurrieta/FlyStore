import { useNavigate } from 'react-router-dom'
import './legal.css'

export function TerminosPage() {
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
        <h1 className="legal-title">Términos y Condiciones</h1>
        <p className="legal-updated">Última actualización: julio de 2025</p>
      </div>

      {/* Content */}
      <div className="legal-content">

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">01</span>
            Aceptación de los términos
          </h2>
          <p>
            Al acceder o utilizar el sitio web{' '}
            <a href="https://flystore.mx" className="legal-link">flystore.mx</a> y/o crear una cuenta
            en nuestra plataforma, aceptas quedar vinculado por los presentes Términos y Condiciones.
            Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestros servicios.
          </p>
          <p>
            <strong style={{ color: '#fff', fontWeight: 600 }}>FLY Store</strong> se reserva el derecho
            de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor a partir
            de su publicación en el sitio web.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">02</span>
            Descripción del servicio
          </h2>
          <p>
            FLY Store es una tienda de moda y estilo de vida con base en Ciudad Obregón, Sonora, México,
            que comercializa productos de las categorías: fragrancias (FLY Essence), gorras, ropa y calzado.
          </p>
          <p>
            El acceso a nuestro sitio web es gratuito. Algunos servicios, como la compra de productos,
            pueden requerir el registro de una cuenta y estar sujetos a cargos adicionales.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">03</span>
            Registro y cuenta de usuario
          </h2>
          <p>
            Para realizar compras deberás crear una cuenta proporcionando información verídica,
            completa y actualizada. Eres responsable de:
          </p>
          <ul>
            <li>Mantener la confidencialidad de tu PIN de acceso</li>
            <li>Todas las actividades que ocurran bajo tu cuenta</li>
            <li>Notificarnos de inmediato ante cualquier uso no autorizado de tu cuenta</li>
          </ul>
          <p>
            FLY Store se reserva el derecho de suspender o cancelar cuentas que incumplan estos
            términos o que sean utilizadas de forma fraudulenta.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">04</span>
            Productos y precios
          </h2>
          <p>
            Nos esforzamos por mantener la información de productos (descripción, imágenes, tallas y precios)
            actualizada y precisa. Sin embargo, pueden presentarse errores. En caso de error de precio
            confirmado en un pedido ya procesado, te contactaremos para ofrecerte la opción de aceptar
            el precio correcto o cancelar el pedido sin cargo alguno.
          </p>
          <p>
            Todos los precios están expresados en Pesos Mexicanos (MXN) e incluyen el IVA correspondiente,
            salvo que se indique lo contrario. FLY Store puede modificar precios en cualquier momento
            sin previo aviso; los cambios no afectarán pedidos ya confirmados.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">05</span>
            Proceso de compra
          </h2>
          <p>
            Al realizar un pedido en FLY Store confirmas que:
          </p>
          <ul>
            <li>Tienes al menos 18 años de edad o cuentas con autorización de un tutor legal</li>
            <li>La información de envío proporcionada es correcta y completa</li>
            <li>Dispones de autorización para utilizar el método de pago seleccionado</li>
          </ul>
          <p>
            La confirmación del pedido por correo electrónico constituye la aceptación de tu orden
            y el inicio del proceso de preparación. FLY Store podrá rechazar o cancelar pedidos
            por motivos de seguridad, stock insuficiente o error de precios.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">06</span>
            Envíos y entregas
          </h2>
          <p>
            Los tiempos de entrega son estimados y pueden variar según la zona geográfica, disponibilidad
            de stock y la empresa de mensajería seleccionada. FLY Store no se hace responsable por
            retrasos causados por fenómenos naturales, huelgas u otras causas de fuerza mayor ajenas
            a nuestro control.
          </p>
          <p>
            Al recibir tu pedido, verifica que el paquete esté en buen estado antes de firmar. En caso
            de daños visibles durante el transporte, notifícanos dentro de las 24 horas siguientes
            a la recepción.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">07</span>
            Devoluciones y cambios
          </h2>
          <p>
            Aceptamos devoluciones y cambios dentro de los <strong style={{ color: '#fff', fontWeight: 600 }}>7 días naturales</strong> siguientes
            a la recepción del producto, siempre que:
          </p>
          <ul>
            <li>El producto no haya sido usado, lavado ni alterado</li>
            <li>Cuente con etiquetas originales y empaque en buen estado</li>
            <li>Se presente el comprobante de compra</li>
          </ul>
          <div className="legal-highlight">
            <p>
              Los productos de la categoría <strong style={{ color: '#fff', fontWeight: 500 }}>FLY Essence (fragancias)</strong> no
              admiten devolución una vez abiertos por razones de higiene, salvo defecto de fabricación comprobable.
            </p>
          </div>
          <p>
            Para iniciar un proceso de devolución contáctanos vía WhatsApp o a{' '}
            <a href="mailto:contacto@flystore.mx" className="legal-link">contacto@flystore.mx</a>.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">08</span>
            Propiedad intelectual
          </h2>
          <p>
            Todo el contenido de flystore.mx — incluyendo logotipos, imágenes, textos, diseños y código
            fuente — es propiedad exclusiva de FLY Store o de sus respectivos titulares, y está protegido
            por la legislación mexicana e internacional sobre propiedad intelectual.
          </p>
          <p>
            Queda expresamente prohibida la reproducción, distribución, modificación o uso comercial
            de cualquier contenido sin autorización escrita previa de FLY Store.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">09</span>
            Limitación de responsabilidad
          </h2>
          <p>
            FLY Store no será responsable por daños indirectos, incidentales o consecuentes derivados
            del uso o imposibilidad de uso de nuestros servicios, incluyendo pérdida de datos o
            interrupción del negocio.
          </p>
          <p>
            Nuestra responsabilidad total ante cualquier reclamación no excederá el monto pagado
            por el producto o servicio que dio origen a la reclamación.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">10</span>
            Conducta del usuario
          </h2>
          <p>Al utilizar nuestra plataforma te comprometes a no:</p>
          <ul>
            <li>Proporcionar información falsa durante el registro o proceso de compra</li>
            <li>Intentar acceder sin autorización a sistemas o cuentas de otros usuarios</li>
            <li>Utilizar la plataforma para actividades ilegales o fraudulentas</li>
            <li>Enviar comunicaciones no solicitadas (spam) a través de nuestros canales</li>
            <li>Publicar contenido ofensivo, difamatorio o que infrinja derechos de terceros</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">11</span>
            Ley aplicable y jurisdicción
          </h2>
          <p>
            Los presentes Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos.
            Para cualquier controversia derivada de su interpretación o cumplimiento, las partes se
            someten expresamente a la jurisdicción de los tribunales competentes de Ciudad Obregón,
            Sonora, renunciando a cualquier otro fuero que pudiera corresponderles.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-section-title">
            <span className="legal-section-num">12</span>
            Contacto
          </h2>
          <p>
            Si tienes preguntas o comentarios sobre estos Términos y Condiciones puedes contactarnos:
          </p>
          <ul>
            <li>
              Correo electrónico:{' '}
              <a href="mailto:contacto@flystore.mx" className="legal-link">contacto@flystore.mx</a>
            </li>
            <li>Ciudad Obregón, Sonora, México</li>
            <li>
              WhatsApp disponible en{' '}
              <a href="https://flystore.mx" className="legal-link">flystore.mx</a>
            </li>
          </ul>
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
