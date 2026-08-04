export const NAVIGATION = {
  HOME: 'home',

  CAPS: 'flycaps',

  CLOTHES: 'flyclothes',

  ESSENCE: 'flyessence',

  SHOES: 'flyshoes',

  PROFILE: 'profile',

  FAVORITES: 'favorites',

  ORDERS: 'orders',
} as const

export type NavigationSection =
  typeof NAVIGATION[keyof typeof NAVIGATION]