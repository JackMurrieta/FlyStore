import { useLocation } from 'react-router-dom'

import { ROUTES } from '../routes/routes'
import { NAVIGATION } from '../routes/navigation'

export function useActiveSection() {
  const { pathname } = useLocation()

  if (pathname === ROUTES.HOME)
    return NAVIGATION.HOME

  if (pathname.startsWith(ROUTES.CAPS))
    return NAVIGATION.CAPS

  if (pathname.startsWith(ROUTES.CLOTHES))
    return NAVIGATION.CLOTHES

  if (pathname.startsWith(ROUTES.ESSENCE))
    return NAVIGATION.ESSENCE

  if (pathname.startsWith(ROUTES.SHOES))
    return NAVIGATION.SHOES

  if (
    pathname.startsWith(ROUTES.LOGIN) ||
    pathname.startsWith(ROUTES.ACCOUNT)
  )
    return NAVIGATION.PROFILE

  if (pathname.startsWith(ROUTES.FAVORITES))
    return NAVIGATION.FAVORITES

  if (pathname.startsWith(ROUTES.ORDERS))
    return NAVIGATION.ORDERS

  return undefined
}