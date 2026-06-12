import { and, desc, eq, gte, like, sql } from 'drizzle-orm';

import { shiftMonthYear } from '@/utils/dates';

import { db } from '../client';
import {
  categories,
  transactions,
  type Category,
  type NewTransaction,
  type Transaction,
} from '../schema';

export type TransactionWithCategory = Transaction & {
  category: Category | null;
};

interface TransactionFilter {
  type?: 'expense' | 'income';
  categoryId?: number;
}

export async function getTransactionsByMonth(
  monthYear: string,
  filter: TransactionFilter = {},
): Promise<TransactionWithCategory[]> {
  const conditions = [like(transactions.date, `${monthYear}-%`)];
  if (filter.type) conditions.push(eq(transactions.type, filter.type));
  if (filter.categoryId != null) {
    conditions.push(eq(transactions.categoryId, filter.categoryId));
  }
  const rows = await db
    .select({ transaction: transactions, category: categories })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.id));
  return rows.map((r) => ({ ...r.transaction, category: r.category }));
}

export async function getRecentTransactions(
  limit = 5,
): Promise<TransactionWithCategory[]> {
  const rows = await db
    .select({ transaction: transactions, category: categories })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(limit);
  return rows.map((r) => ({ ...r.transaction, category: r.category }));
}

/** Totales de ingresos y gastos de un mes "YYYY-MM". */
export async function getMonthTotals(
  monthYear: string,
): Promise<{ income: number; expense: number }> {
  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(like(transactions.date, `${monthYear}-%`))
    .groupBy(transactions.type);
  const totals = { income: 0, expense: 0 };
  for (const row of rows) totals[row.type] = row.total;
  return totals;
}

export interface CategoryTotal {
  categoryId: number | null;
  name: string;
  color: string;
  icon: string;
  total: number;
}

/** Gastos del mes agrupados por categoría, de mayor a menor. */
export async function getExpensesByCategory(
  monthYear: string,
): Promise<CategoryTotal[]> {
  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      name: sql<string>`coalesce(${categories.name}, 'Sin categoría')`,
      color: sql<string>`coalesce(${categories.color}, '#888780')`,
      icon: sql<string>`coalesce(${categories.icon}, 'Gift')`,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        like(transactions.date, `${monthYear}-%`),
        eq(transactions.type, 'expense'),
      ),
    )
    .groupBy(transactions.categoryId)
    .orderBy(desc(sql`sum(${transactions.amount})`));
  return rows;
}

export interface MonthlySeriesPoint {
  monthYear: string;
  income: number;
  expense: number;
}

/** Serie de ingresos/gastos por mes para los últimos `months` meses (incluye el actual). */
export async function getMonthlySeries(
  months: number,
  currentMonth: string,
): Promise<MonthlySeriesPoint[]> {
  const firstMonth = shiftMonthYear(currentMonth, -(months - 1));
  const rows = await db
    .select({
      monthYear: sql<string>`substr(${transactions.date}, 1, 7)`,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(gte(transactions.date, `${firstMonth}-01`))
    .groupBy(sql`substr(${transactions.date}, 1, 7)`, transactions.type);

  const byMonth = new Map<string, MonthlySeriesPoint>();
  for (let i = 0; i < months; i++) {
    const my = shiftMonthYear(firstMonth, i);
    byMonth.set(my, { monthYear: my, income: 0, expense: 0 });
  }
  for (const row of rows) {
    const point = byMonth.get(row.monthYear);
    if (point) point[row.type] = row.total;
  }
  return [...byMonth.values()];
}

/** Fechas (ISO, desc, sin repetir) en las que se registró al menos una transacción. */
export async function getRegisteredDates(limit = 400): Promise<string[]> {
  const rows = await db
    .selectDistinct({ date: transactions.date })
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(limit);
  return rows.map((r) => r.date);
}

export async function createTransaction(data: NewTransaction): Promise<void> {
  await db.insert(transactions).values(data);
}

export async function updateTransaction(
  id: number,
  data: Partial<NewTransaction>,
): Promise<void> {
  await db.update(transactions).set(data).where(eq(transactions.id, id));
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
}
