/** "$1.234.567" — pesos chilenos, sin decimales */
export function formatCLP(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '−' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits}`;
}

/** "$1,234.56" — dólares con dos decimales */
export function formatUSD(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  const [int, dec] = Math.abs(amount).toFixed(2).split('.');
  const digits = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${digits}.${dec}`;
}

/** Formato por defecto de la app */
export const formatMoney = formatCLP;
