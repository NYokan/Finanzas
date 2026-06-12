// Paleta oficial de Magsave (tema oscuro) — mantener en sincronía con tailwind.config.js
export const colors = {
  primary: '#7C6FF7', // violeta — acento principal
  primaryDim: '#2B2650', // tinte violeta para fondos de cards/chips
  accent: '#8AD8EA', // cyan — acento secundario decorativo
  success: '#3ECF8E', // verde — ingresos, metas cumplidas
  successDim: '#173B2D', // tinte verde para fondos
  danger: '#F07A50', // coral — gastos, alertas
  dangerDim: '#3D241B', // tinte coral para fondos
  warning: '#F2C14E', // ámbar — advertencias, cerca del límite
  bg: '#0E0E10', // fondo general, casi negro
  surface: '#1A1A1E', // cards
  textPrimary: '#F5F5F4',
  textSecondary: '#9C9CA3',
  border: '#2A2A30',
} as const;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;
