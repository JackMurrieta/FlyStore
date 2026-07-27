import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './components/header/header'
import { Navbar } from './components/navbar/navbar'

function App() {
  const [cartCount, setCartCount] = useState(0)
  const [navOpen, setNavOpen]     = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  return (
    <>
      <Header
        cartCount={cartCount}
        onMenuClick={() => setNavOpen(true)}
        onProfileClick={() => setActiveSection('profile')}
        onCartClick={() => setCartCount(c => c + 1)}
        onLogoClick={() => setActiveSection('home')}
      />
      <Navbar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onOpen={() => setNavOpen(true)}
        cartCount={cartCount}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onCartClick={() => setCartCount(c => c + 1)}
      />
      <Outlet />
    </>
  )
}

export default App
