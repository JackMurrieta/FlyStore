import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import { Header } from "./components/header/header";
import { Navbar } from "./components/navbar/navbar";

import { useActiveSection } from "./hooks/useActiveSection";
import { ROUTES } from "./routes/routes";

function App() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const activeSection = useActiveSection();

  return (
    <>
      <Header
        cartCount={cartCount}
        onMenuClick={() => setNavOpen(true)}
        onProfileClick={() => navigate(ROUTES.LOGIN)}
        onLogoClick={() => navigate(ROUTES.HOME)}
        onCartClick={() => setCartCount((c) => c + 1)}
      />

      <Navbar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onOpen={() => setNavOpen(true)}
        cartCount={cartCount}
        activeSection={activeSection}
        onCartClick={() => setCartCount((c) => c + 1)}
      />

      <Outlet />
    </>
  );
}

export default App;