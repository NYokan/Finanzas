// Helpers de fecha en español, sin depender de Intl (consistente en Hermes/Android)

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const WEEKDAYS = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Date local → "2024-03-15" */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "2024-03-15" → Date a medianoche local */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** "2024-03" del mes actual */
export function currentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

/** "2024-03-15" → "2024-03" */
export function monthYearOf(iso: string): string {
  return iso.slice(0, 7);
}

/** Suma `delta` meses a un "YYYY-MM" */
export function shiftMonthYear(monthYear: string, delta: number): string {
  const [y, m] = monthYear.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** "2024-03" → "marzo 2024" */
export function monthYearLabel(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "2024-03" → "Marzo" */
export function monthShortLabel(monthYear: string): string {
  const m = Number(monthYear.split('-')[1]);
  return capitalize(MONTHS[m - 1].slice(0, 3));
}

/** Date → "Viernes 15 de marzo" */
export function fullDateLabel(d: Date): string {
  return `${capitalize(WEEKDAYS[d.getDay()])} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  const aMid = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bMid = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bMid - aMid) / DAY_MS);
}

/** "2024-03-15" → "Hoy" | "Ayer" | "Hace 3 días" | "Lunes 11 de marzo" */
export function relativeDateLabel(iso: string): string {
  const d = parseISODate(iso);
  const diff = daysBetween(d, new Date());
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff > 1 && diff < 7) return `Hace ${diff} días`;
  return fullDateLabel(d);
}

/** "2024-03-15 14:23:45" (UTC de SQLite) → "11:23" hora local */
export function timeLabel(createdAt: string | null): string {
  if (!createdAt) return '';
  const d = new Date(`${createdAt.replace(' ', 'T')}Z`);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getHours()}:${pad2(d.getMinutes())}`;
}

/** Etiqueta de grupo por fecha: "Hoy", "Ayer" o "Lunes 11 de marzo" */
export function dateGroupLabel(iso: string): string {
  const d = parseISODate(iso);
  const diff = daysBetween(d, new Date());
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return fullDateLabel(d);
}

/** Saludo según la hora del día */
export function greeting(name: string, now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return `Buenos días ${name} ☀️`;
  if (h >= 12 && h < 19) return `Buenas tardes ${name} 🌤`;
  return `Buenas noches ${name} 🌙`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Días que faltan para el próximo vencimiento de un gasto fijo.
 * 0 = hoy; si ya pasó este mes, cuenta hacia el mes siguiente.
 * El día se ajusta al largo del mes (día 31 en febrero → último día).
 */
export function daysUntilDue(dayOfMonth: number, now: Date = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth();
  const dueThisMonth = Math.min(dayOfMonth, daysInMonth(year, month));
  if (dueThisMonth >= now.getDate()) {
    return dueThisMonth - now.getDate();
  }
  const dueNext = Math.min(dayOfMonth, daysInMonth(year, month + 1));
  return new Date(year, month + 1, dueNext).getDate() +
    daysInMonth(year, month) - now.getDate();
}

/**
 * Racha de días seguidos registrando transacciones. Si hoy aún no se
 * registra nada, la racha sigue viva contando desde ayer.
 */
export function computeStreak(dates: string[], now: Date = new Date()): number {
  const set = new Set(dates);
  const cursor = new Date(now);
  if (!set.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Fecha de vencimiento (ISO) del gasto fijo dentro de un mes "YYYY-MM" */
export function dueDateInMonth(dayOfMonth: number, monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number);
  const day = Math.min(dayOfMonth, daysInMonth(y, m - 1));
  return `${y}-${pad2(m)}-${pad2(day)}`;
}
