import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routes"; // Ajusta el path según tu estructura
import "./navbar.css";

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  cartCount?: number;
  activeSection?: string;
  onCartClick?: () => void;
}

export function Navbar({
  isOpen,
  onClose,
  onOpen,
  cartCount = 0,
  activeSection = "home",
  onCartClick,
}: NavbarProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Función independiente para acción externa (WhatsApp)
  const openWhatsApp = () => {
    onClose();
    window.open(ROUTES.WHATSAPP, "_blank", "noopener,noreferrer");
  };

  const active = (id: string) => (activeSection === id ? " active" : "");

  return (
    <>
      {/* Overlay */}
      <div
        className={`nb-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide drawer */}
      <nav
        className={`nb-drawer${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        aria-hidden={!isOpen}
      >
        {/* Head */}
        <div className="nb-head">
          <img src="/logos/fly-logo.png" alt="FLY Store" className="nb-logo" />
          <button
            ref={closeRef}
            className="nb-close"
            onClick={onClose}
            aria-label="Cerrar menú"
            type="button"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>

        {/* Tienda */}
        <div className="nb-section">
          <span className="nb-section-label">Tienda</span>

          <Link
            to={ROUTES.HOME}
            className={`nb-item${active("home")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">Inicio</span>
              <span className="nb-sub">Volver al inicio</span>
            </span>
          </Link>

          <Link
            to={ROUTES.ESSENCE}
            className={`nb-item${active("essence")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L7.5 12a5 5 0 0 0 9 0L12 2z" />
                <path d="M9.5 14.5A2.5 2.5 0 0 0 12 17" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">FLY Essence</span>
              <span className="nb-sub">Fragancias exclusivas</span>
            </span>
          </Link>

          <Link
            to={ROUTES.CAPS}
            className={`nb-item${active("caps")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L3 10h18L12 3z" />
                <path d="M3 10v2h18v-2" />
                <path d="M5 12v5a7 7 0 0 0 14 0v-5" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">FLY Caps</span>
              <span className="nb-sub">Gorras y accesorios</span>
            </span>
          </Link>

          <Link
            to={ROUTES.CLOTHES}
            className={`nb-item${active("clothes")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">FLY Clothes</span>
              <span className="nb-sub">Ropa de temporada</span>
            </span>
          </Link>

          <Link
            to={ROUTES.SHOES}
            className={`nb-item${active("shoes")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17h9l8-4.5V9l-5 1.5H3V17z" />
                <path d="M7 17v-4" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">FLY Shoes</span>
              <span className="nb-sub">Calzado premium</span>
            </span>
          </Link>
        </div>

        {/* Mi cuenta */}
        <div className="nb-section">
          <span className="nb-section-label">Mi cuenta</span>

          <Link
            to={ROUTES.LOGIN}
            className={`nb-item${active("profile")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">Mi perfil</span>
              <span className="nb-sub">Configurar cuenta</span>
            </span>
          </Link>

          <Link
            to={ROUTES.FAVORITES}
            className={`nb-item${active("favorites")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">Favoritos</span>
              <span className="nb-sub">Productos guardados</span>
            </span>
          </Link>

          <Link
            to={ROUTES.ORDERS}
            className={`nb-item${active("orders")}`}
            onClick={onClose}
          >
            <span className="nb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">Mis pedidos</span>
              <span className="nb-sub">Historial de compras</span>
            </span>
          </Link>
        </div>

        {/* Contacto */}
        <div className="nb-section">
          <span className="nb-section-label">Contacto</span>

          <button
            className="nb-item nb-item--wa"
            onClick={openWhatsApp}
            type="button"
          >
            <span className="nb-ico">
              <svg viewBox="0 0 22 22" fill="currentColor">
                <path d="M11 2C6.03 2 2 6.03 2 11c0 1.77.49 3.42 1.34 4.84L2 20l4.27-1.32A8.96 8.96 0 0 0 11 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm4.42 12.5c-.18.5-.88.92-1.44 1.04-.38.08-.88.14-2.55-.55-2.14-.87-3.52-3.05-3.62-3.19-.1-.14-.84-1.12-.84-2.14 0-1.01.53-1.51.72-1.72.18-.2.4-.25.53-.25h.38c.12 0 .29-.04.45.34.18.4.6 1.47.65 1.58.05.1.09.23.02.37-.07.14-.1.22-.2.34-.1.12-.2.26-.3.35-.1.1-.2.2-.09.39.12.2.52.86 1.12 1.39.77.68 1.42.89 1.62.99.2.1.32.08.43-.05.12-.14.5-.59.63-.79.14-.2.28-.16.47-.1.19.07 1.2.56 1.41.67.2.1.33.16.38.24.04.1.04.54-.14 1.04z" />
              </svg>
            </span>
            <span className="nb-body">
              <span className="nb-name">WhatsApp</span>
              <span className="nb-sub">Atención directa</span>
            </span>
          </button>
        </div>

        <div className="nb-footer">FLY Store · Ciudad Obregón</div>
      </nav>

      {/* Bottom nav — visible only on mobile */}
      <nav className="nb-bottom" aria-label="Navegación inferior">
        <div className="nb-bottom-row">
          <Link
            to={ROUTES.HOME}
            className={`nb-bn${active("home")}`}
            aria-label="Inicio"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
            <span>Inicio</span>
          </Link>

          <button
            className={`nb-bn${isOpen ? " active" : ""}`}
            onClick={isOpen ? onClose : onOpen}
            aria-label="Menú"
            aria-expanded={isOpen}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            <span>Menú</span>
          </button>

          <button
            className="nb-bn"
            onClick={onCartClick}
            aria-label={`Carrito${cartCount > 0 ? `, ${cartCount} artículos` : ""}`}
            type="button"
          >
            {cartCount > 0 && (
              <span className="nb-bn-badge" aria-hidden="true">
                {cartCount}
              </span>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Carrito</span>
          </button>

          <Link
            to={ROUTES.LOGIN}
            className={`nb-bn${active("profile")}`}
            aria-label="Mi cuenta"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
            <span>Cuenta</span>
          </Link>
        </div>
      </nav>
    </>
  );
}