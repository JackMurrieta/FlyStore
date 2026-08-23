import { createBrowserRouter } from "react-router-dom";
import App from "../App";

import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/auth/login";
import { CuentaPage } from "../pages/cuenta/CuentaPage";
import { GoogleCallback } from "../pages/GoogleCallback";

import { PrivacidadPage } from "../pages/legal/privacidad";
import { TerminosPage } from "../pages/legal/terminos";

import { ROUTES } from "./routes";
import { ProtectedRoute } from "../context/ProtectedRoute";
import { CatalogPage } from "../pages/tienda/CatalogPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "flycaps",
        element: <CatalogPage />,
      },
      {
        path: "flyclothes",
        element: <CatalogPage />,
      },
      {
        path: "flyessence",
        element: <CatalogPage />,
      },
      {
        path: "flyshoes",
        element: <CatalogPage />,
      },

      {
        path: "cuenta",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <CuentaPage />,
          },
        ],
      },
      {
        path: "cuenta/favoritos",
        element: <ProtectedRoute />,
      },
      {
        path: "cuenta/pedidos",
        element: <ProtectedRoute />,
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.GOOGLE_CALLBACK,
    element: <GoogleCallback />,
  },
  {
    path: ROUTES.PRIVACY,
    element: <PrivacidadPage />,
  },
  {
    path: ROUTES.TERMS,
    element: <TerminosPage />,
  },
]);
