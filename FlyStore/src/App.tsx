import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import { Header } from "./components/header/header";
import { Navbar } from "./components/navbar/navbar";

import { useActiveSection } from "./hooks/useActiveSection";
import { useAuth } from "./hooks/auth/useAuth";
import { ROUTES } from "./routes/routes";

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const activeSection = useActiveSection();

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setCartCount((c) => c + 1);
  };

  return (
    <>
      <Header
        cartCount={cartCount}
        onMenuClick={() => setNavOpen(true)}
        onProfileClick={() => navigate(isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN)}
        onLogoClick={() => navigate(ROUTES.HOME)}
        onCartClick={handleCartClick}
      />

      <Navbar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onOpen={() => setNavOpen(true)}
        cartCount={cartCount}
        activeSection={activeSection}
        onCartClick={handleCartClick}
      />

      <Outlet />
    </>
  );
}

export default App;