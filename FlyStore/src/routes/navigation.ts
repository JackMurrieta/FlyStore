export const NAVIGATION = {
  HOME: 'home',

  CAPS: 'caps',

  CLOTHES: 'clothes',

  ESSENCE: 'essence',

  SHOES: 'shoes',

  PROFILE: 'profile',

  FAVORITES: 'favorites',

  ORDERS: 'orders',
} as const

export type NavigationSection =
  typeof NAVIGATION[keyof typeof NAVIGATION]