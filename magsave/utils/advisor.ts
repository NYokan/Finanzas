// Motor de consejos económicos 100% local: reglas puras sobre los
// agregados de SQLite. Sin APIs externas (spec: sin cuenta, sin nube).
import {
  Coins,
  Fire,
  House,
  PiggyBank,
  TrendUp,
  type Icon,
} from 'phosphor-react-native';

import type { BudgetSummary } from '@/db/queries/budgets';
import type { GoalWithProgress } from '@/db/queries/savings';
import type {
  CategoryTotal,
  TransactionWithCategory,
} from '@/db/queries/transactions';
import { formatMoney } from '@/utils/currency';
import {
  computeStreak,
  daysInMonth,
  monthYearLabel,
  parseISODate,
  toISODate,
} from '@/utils/dates';

export type AdviceTone = 'info' | 'warn' | 'win';

export interface Advice {
  id: string;
  icon: Icon;
  title: string;
  body: string;
  tone: AdviceTone;
}

export interface AdvisorInputs {
  now: Date;
  /** gastos por categoría del mes actual y del anterior */
  byCategoryNow: CategoryTotal[];
  byCategoryPrev: CategoryTotal[];
  budget: BudgetSummary;
  /** suma de gastos fijos activos */
  fixedTotal: number;
  monthTotals: { income: number; expense: number };
  goals: GoalWithProgress[];
  /** fechas ISO con al menos una transacción (desc) */
  registeredDates: string[];
  /** transacciones de gasto del mes actual */
  monthExpenses: TransactionWithCategory[];
}

const TONE_ORDER: Record<AdviceTone, number> = { warn: 0, info: 1, win: 2 };
const MAX_ADVICE = 5;
const ANT_THRESHOLD = 5_000; // gasto "hormiga": menos de $5.000
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Corre todas las reglas y devuelve los consejos aplicables (warn primero). */
export function buildAdvice(inputs: AdvisorInputs): Advice[] {
  const advice = [
    budgetPaceAdvice(inputs),
    categoryDeltaAdvice(inputs),
    fixedWeightAdvice(inputs),
    antExpensesAdvice(inputs),
    goalProjectionAdvice(inputs),
    streakAdvice(inputs),
  ].filter((a): a is Advice => a !== null);
  return advice
    .sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone])
    .slice(0, MAX_ADVICE);
}

/** Ritmo de gasto vs presupuesto: proyección lineal del día del mes. */
function budgetPaceAdvice({ now, budget }: AdvisorInputs): Advice | null {
  const day = now.getDate();
  const { totalBudget, totalSpent } = budget;
  if (day < 3) return null;

  // Sin presupuesto pero con gastos → sugerir que lo configure
  if (totalBudget <= 0) {
    if (totalSpent <= 0) return null;
    return {
      id: 'pace',
      icon: TrendUp,
      title: 'Fija tu presupuesto',
      body: `Ya llevas ${formatMoney(totalSpent)} gastados este mes. Configurar un presupuesto por categoría te ayuda a saber cuánto queda sin hacer cálculos.`,
      tone: 'info',
    };
  }

  const lastDay = daysInMonth(now.getFullYear(), now.getMonth());
  const dailyRate = totalSpent / day;
  const projected = dailyRate * lastDay;

  if (totalSpent >= totalBudget) {
    return {
      id: 'pace',
      icon: TrendUp,
      title: 'Presupuesto superado',
      body: `Ya gastaste ${formatMoney(totalSpent)} de un presupuesto de ${formatMoney(totalBudget)}. Anota igual cada gasto: saberlo es la mitad de la pelea.`,
      tone: 'warn',
    };
  }
  if (projected > totalBudget) {
    const crossingDay = Math.min(lastDay, Math.ceil(totalBudget / dailyRate));
    return {
      id: 'pace',
      icon: TrendUp,
      title: 'Vas rápido este mes',
      body: `A este ritmo te pasas del presupuesto el día ${crossingDay}. Bajar el gasto diario a ${formatMoney((totalBudget - totalSpent) / Math.max(1, lastDay - day))} te deja justo en la meta.`,
      tone: 'warn',
    };
  }
  return {
    id: 'pace',
    icon: TrendUp,
    title: 'Buen ritmo de gasto',
    body: `A este ritmo terminas el mes con ${formatMoney(totalBudget - projected)} de sobra en tu presupuesto. 👏`,
    tone: 'win',
  };
}

/** Comparación mes a mes por categoría: ya superaste lo del mes pasado en >20%. */
function categoryDeltaAdvice({
  byCategoryNow,
  byCategoryPrev,
}: AdvisorInputs): Advice | null {
  const prev = new Map(byCategoryPrev.map((c) => [c.categoryId, c.total]));
  let worst: { name: string; pct: number } | null = null;
  for (const cat of byCategoryNow) {
    const prevTotal = prev.get(cat.categoryId) ?? 0;
    if (prevTotal < ANT_THRESHOLD) continue; // base muy chica, % engañoso
    const pct = Math.round((cat.total / prevTotal - 1) * 100);
    if (pct >= 20 && (!worst || pct > worst.pct)) {
      worst = { name: cat.name, pct };
    }
  }
  if (!worst) return null;
  return {
    id: 'cat-delta',
    icon: Coins,
    title: `Ojo con ${worst.name}`,
    body: `En ${worst.name} ya llevas un ${worst.pct}% más que en TODO el mes pasado. ¿Vale la pena revisar esos gastos?`,
    tone: 'warn',
  };
}

/** Peso de los fijos sobre los ingresos del mes (referencia 50/30/20). */
function fixedWeightAdvice({
  fixedTotal,
  monthTotals,
}: AdvisorInputs): Advice | null {
  const income = monthTotals.income;
  if (income <= 0 || fixedTotal <= 0) return null;
  const pct = Math.round((fixedTotal / income) * 100);
  if (pct > 50) {
    return {
      id: 'fixed-weight',
      icon: House,
      title: 'Fijos pesados',
      body: `Tus gastos fijos son el ${pct}% de tus ingresos del mes. La regla 50/30/20 sugiere que necesidades fijas no pasen del 50%.`,
      tone: 'warn',
    };
  }
  if (pct >= 30) {
    return {
      id: 'fixed-weight',
      icon: House,
      title: 'Fijos bajo control',
      body: `Tus gastos fijos son el ${pct}% de tus ingresos: dentro del 50% que recomienda la regla 50/30/20.`,
      tone: 'info',
    };
  }
  return {
    id: 'fixed-weight',
    icon: House,
    title: 'Gastos fijos saludables',
    body: `Solo el ${pct}% de tus ingresos va a gastos fijos — muy por debajo del 50% recomendado. Tienes buen margen para ahorrar.`,
    tone: 'win',
  };
}

/** Gastos hormiga: ≥3 gastos chicos de la misma categoría en 7 días. */
function antExpensesAdvice({ now, monthExpenses }: AdvisorInputs): Advice | null {
  const weekAgo = new Date(now.getTime() - WEEK_MS);
  const floor = toISODate(weekAgo);
  const byCategory = new Map<string, { count: number; total: number }>();
  for (const tx of monthExpenses) {
    if (tx.amount >= ANT_THRESHOLD || tx.date < floor) continue;
    const name = tx.category?.name ?? 'Sin categoría';
    const entry = byCategory.get(name) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += tx.amount;
    byCategory.set(name, entry);
  }
  let top: { name: string; count: number; total: number } | null = null;
  for (const [name, { count, total }] of byCategory) {
    if (count >= 3 && (!top || total > top.total)) top = { name, count, total };
  }
  if (!top) return null;
  return {
    id: 'ants',
    icon: Coins,
    title: 'Gastos hormiga 🐜',
    body: `Esta semana van ${top.count} gastos chicos en ${top.name}: ${formatMoney(top.total)} en total. Chiquitos, pero suman.`,
    tone: 'info',
  };
}

/** Proyección de la meta activa con más avance: fecha estimada al ritmo actual. */
function goalProjectionAdvice({ now, goals }: AdvisorInputs): Advice | null {
  const active = goals.filter(
    (g) => !g.isCompleted && g.saved > 0 && g.saved < g.targetAmount,
  );
  if (active.length === 0) return null;
  const goal = active.reduce((best, g) =>
    g.saved / g.targetAmount > best.saved / best.targetAmount ? g : best,
  );

  const created = goal.createdAt
    ? new Date(`${goal.createdAt.replace(' ', 'T')}Z`)
    : null;
  if (!created || Number.isNaN(created.getTime())) return null;
  const weeksElapsed = Math.max(1, (now.getTime() - created.getTime()) / WEEK_MS);
  const weeklyAvg = goal.saved / weeksElapsed;
  if (weeklyAvg <= 0) return null;

  const weeksLeft = (goal.targetAmount - goal.saved) / weeklyAvg;
  const eta = new Date(now.getTime() + weeksLeft * WEEK_MS);
  const etaLabel = monthYearLabel(
    `${eta.getFullYear()}-${String(eta.getMonth() + 1).padStart(2, '0')}`,
  );

  if (goal.deadline && eta > parseISODate(goal.deadline)) {
    return {
      id: 'goal-eta',
      icon: PiggyBank,
      title: `"${goal.name}" va atrasada`,
      body: `Al ritmo actual (${formatMoney(weeklyAvg)}/semana) la completas en ${etaLabel}, después de tu fecha límite. Un empujón extra la salva.`,
      tone: 'warn',
    };
  }
  return {
    id: 'goal-eta',
    icon: PiggyBank,
    title: `"${goal.name}" en camino`,
    body: `Guardando ${formatMoney(weeklyAvg)} a la semana como hasta ahora, la completas en ${etaLabel}.`,
    tone: 'info',
  };
}

/** Racha de registro: refuerzo positivo desde 7 días. */
function streakAdvice({ now, registeredDates }: AdvisorInputs): Advice | null {
  const streak = computeStreak(registeredDates, now);
  if (streak < 7) return null;
  return {
    id: 'streak',
    icon: Fire,
    title: `${streak} días de racha`,
    body: 'Llevas más de una semana registrando todos tus movimientos — quienes anotan, gastan menos. 😉',
    tone: 'win',
  };
}
