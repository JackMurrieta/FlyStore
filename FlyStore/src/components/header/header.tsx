import './header.css'

interface HeaderProps {
  cartCount?: number
  onMenuClick?: () => void
  onProfileClick?: () => void
  onCartClick?: () => void
  onLogoClick?: () => void
}

export function Header({ cartCount = 0, onMenuClick, onProfileClick, onCartClick, onLogoClick }: HeaderProps) {
  return (
    <header className="fly-header" role="banner" aria-label="FLY Store Navigation">
      <div className="nav-left">
        <button className="nav-btn" onClick={onMenuClick} aria-label="Menú" type="button">
          <svg width="16" height="12" viewBox="0 0 18 14" fill="none"
               stroke="rgba(255,255,255,.8)" strokeWidth="1.6" strokeLinecap="round">
            <line x1="0" y1="1" x2="18" y2="1"/>
            <line x1="0" y1="7" x2="13" y2="7"/>
            <line x1="0" y1="13" x2="18" y2="13"/>
          </svg>
        </button>
        <button className="nav-btn" onClick={onProfileClick} aria-label="Mi cuenta" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="rgba(255,255,255,.75)" strokeWidth="1.7" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>

      <div className="nav-center">
        <div
          className="logo-spin-wrap"
          onClick={onLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onLogoClick?.()}
        >
          <img src="/logos/fly-logo.png" alt="FLY" className="logo-spin" />
        </div>
      </div>

      <div className="nav-right">
        <button
          className="nav-btn"
          onClick={onCartClick}
          aria-label="Carrito"
          type="button"
          style={{ position: 'relative' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="rgba(255,255,255,.75)" strokeWidth="1.7" strokeLinecap="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cartCount > 0 && (
            <span className="cart-badge" aria-label={`${cartCount} artículos en carrito`}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
