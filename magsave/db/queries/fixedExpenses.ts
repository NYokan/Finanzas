import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '../client';
import {
  categories,
  fixedExpensePayments,
  fixedExpenses,
  type Category,
  type FixedExpense,
  type NewFixedExpense,
} from '../schema';

export type FixedExpenseWithStatus = FixedExpense & {
  category: Category | null;
  /** null = pendiente este mes */
  paidAt: string | null;
};

/** Gastos fijos activos con su estado de pago para un mes "YYYY-MM". */
export async function getFixedExpenses(
  monthYear: string,
): Promise<FixedExpenseWithStatus[]> {
  const rows = await db
    .select({
      fixed: fixedExpenses,
      category: categories,
      paidAt: fixedExpensePayments.paidAt,
    })
    .from(fixedExpenses)
    .leftJoin(
      fixedExpensePayments,
      and(
        eq(fixedExpensePayments.fixedExpenseId, fixedExpenses.id),
        eq(fixedExpensePayments.monthYear, monthYear),
      ),
    )
    .leftJoin(categories, eq(fixedExpenses.categoryId, categories.id))
    .where(eq(fixedExpenses.isActive, 1))
    .orderBy(asc(fixedExpenses.dayOfMonth));
  return rows.map((r) => ({
    ...r.fixed,
    category: r.category,
    paidAt: r.paidAt ?? null,
  }));
}

/** Suma de todos los gastos fijos activos. */
export async function getActiveFixedTotal(): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${fixedExpenses.amount}), 0)` })
    .from(fixedExpenses)
    .where(eq(fixedExpenses.isActive, 1));
  return rows[0]?.total ?? 0;
}

export async function markPaid(
  fixedExpenseId: number,
  monthYear: string,
): Promise<void> {
  await db.insert(fixedExpensePayments).values({
    fixedExpenseId,
    monthYear,
    paidAt: new Date().toISOString(),
  });
}

export async function unmarkPaid(
  fixedExpenseId: number,
  monthYear: string,
): Promise<void> {
  await db
    .delete(fixedExpensePayments)
    .where(
      and(
        eq(fixedExpensePayments.fixedExpenseId, fixedExpenseId),
        eq(fixedExpensePayments.monthYear, monthYear),
      ),
    );
}

export async function createFixedExpense(
  data: NewFixedExpense,
): Promise<FixedExpense> {
  const rows = await db.insert(fixedExpenses).values(data).returning();
  return rows[0];
}

export async function updateFixedExpense(
  id: number,
  data: Partial<NewFixedExpense>,
): Promise<void> {
  await db.update(fixedExpenses).set(data).where(eq(fixedExpenses.id, id));
}

export async function deleteFixedExpense(id: number): Promise<void> {
  await db
    .delete(fixedExpensePayments)
    .where(eq(fixedExpensePayments.fixedExpenseId, id));
  await db.delete(fixedExpenses).where(eq(fixedExpenses.id, id));
}
