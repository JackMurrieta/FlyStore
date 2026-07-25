import { useState } from 'react'
import { Header } from './components/header'

function App() {
  const [cartCount, setCartCount] = useState(0)

  return (
    <>
      <Header
        cartCount={cartCount}
        onMenuClick={() => console.log('menu')}
        onProfileClick={() => console.log('profile')}
        onCartClick={() => setCartCount(c => c + 1)}
        onLogoClick={() => console.log('logo')}
      />
    </>
  )
}

export default App
