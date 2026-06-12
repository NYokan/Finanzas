// Paleta oficial de Magsave (tema oscuro, guía del usuario 12-jun-2026)
// Mantener en sincronía con tailwind.config.js
export const colors = {
  primary: '#7F56D9', // morado neón — acento principal
  primaryLight: '#9D71FD', // extremo claro del gradiente morado
  primaryDim: '#2A2342', // tinte morado para fondos de chips/cards
  accent: '#47B0FF', // azul claro — acento secundario
  success: '#22C55E', // verde brillante — ingresos, metas cumplidas
  successDim: '#163A26', // tinte verde para fondos
  danger: '#F07A50', // coral — gastos, alertas
  dangerDim: '#3D241B', // tinte coral para fondos
  warning: '#F2C14E', // ámbar — advertencias, cerca del límite
  bg: '#121212', // fondo principal, negro/gris muy oscuro
  surface: '#1E1E24', // cards (gris con toque frío)
  surfaceAlt: '#2A2A30', // círculos de íconos, elementos sobre cards
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#2C2C33',
  glassBorder: 'rgba(255,255,255,0.1)', // borde fino de las glass cards
} as const;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;
