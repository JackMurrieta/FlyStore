// hooks/useLocationBreadcrumb.ts

import { useLocation } from 'react-router-dom'

const labels: Record<string, string> = {
  '': 'Inicio',
  login: 'Iniciar sesión',

  flycaps: 'FLY Caps',
  flyclothes: 'FLY Clothes',
  flyessence: 'FLY Essence',
  flyshoes: 'FLY Shoes',

  privacidad: 'Privacidad',
  terminos: 'Términos',
}

export function useLocationBreadcrumb() {
  const { pathname } = useLocation()

  const segments = pathname
    .split('/')
    .filter(Boolean)

  const breadcrumb = [
    {
      name: 'Inicio',
      path: '/',
    },
    ...segments.map((segment, index) => ({
      name: labels[segment] ?? decodeURIComponent(segment),
      path: '/' + segments.slice(0, index + 1).join('/'),
    })),
  ]

  return breadcrumb
}