// Paleta oficial de Magsave — mantener en sincronía con tailwind.config.js
export const colors = {
  primary: '#7C6FF7', // violeta suave — acento principal
  primaryDim: '#EEEDFE', // fondo de cards violeta
  success: '#1D9E75', // verde — ingresos, metas cumplidas
  danger: '#D85A30', // coral — gastos, alertas
  warning: '#EF9F27', // ámbar — advertencias, cerca del límite
  bg: '#F7F6F3', // fondo general, crema muy suave
  surface: '#FFFFFF', // cards
  textPrimary: '#1A1A18',
  textSecondary: '#6B6B67',
  border: '#E8E6E0',
} as const;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
} as const;
