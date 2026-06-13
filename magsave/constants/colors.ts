// Paleta oficial de Magsave (modo claro + rosa, guía del usuario 12-jun-2026, v3)
// Mantener en sincronía con tailwind.config.js
export const colors = {
  primary: '#FF6A88', // rosa de acento — interactivo, activo
  primaryLight: '#FF9A9E', // rosa melocotón — extremo del gradiente hero
  primaryDim: '#FFE9EE', // tinte rosa para fondos de chips/cards
  success: '#16A34A', // verde — ingresos, metas cumplidas (legible sobre claro)
  successDim: '#E8F6EE', // tinte verde para fondos
  danger: '#E25C3D', // coral — gastos, alertas
  dangerDim: '#FDEDE6', // tinte coral para fondos
  warning: '#D99A1B', // ámbar — advertencias, cerca del límite
  bg: '#F7F7F9', // fondo principal, gris muy claro (no blanco puro)
  surface: '#FFFFFF', // cards blancas
  surfaceAlt: '#F0F0F0', // círculos de íconos, elementos sobre cards
  textPrimary: '#1C1C1E', // casi negro — títulos y montos
  textSecondary: '#8E8E93', // gris medio — subtítulos y fechas
  border: '#ECECF0',
  glassBorder: 'rgba(255,255,255,0.5)', // borde glass de la hero card
} as const;

// Gradiente de la tarjeta principal del Home (rosa melocotón → rosa suave)
export const HERO_GRADIENT = ['#FF9A9E', '#FECFEF'] as const;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
} as const;

// Glow rosa para la hero card (reemplaza la sombra negra)
export const glowPink = {
  shadowColor: '#FF9A9E',
  shadowOpacity: 0.3,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;
