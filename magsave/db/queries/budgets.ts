import { and, eq, like, sql } from 'drizzle-orm';

import { db } from '../client';
import {
  budgets,
  categories,
  transactions,
  type Budget,
  type Category,
} from '../schema';
import { getExpensesByCategory } from './transactions';

export type BudgetWithUsage = Budget & {
  category: Category | null;
  spent: number;
};

/** Presupuestos del mes con lo gastado por categoría. */
export async function getBudgetsWithUsage(
  monthYear: string,
): Promise<BudgetWithUsage[]> {
  const rows = await db
    .select({ budget: budgets, category: categories })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.monthYear, monthYear));

  const spentByCategory = new Map(
    (await getExpensesByCategory(monthYear)).map((c) => [c.categoryId, c.total]),
  );

  return rows.map((r) => ({
    ...r.budget,
    category: r.category,
    spent: spentByCategory.get(r.budget.categoryId) ?? 0,
  }));
}

export interface BudgetSummary {
  /** suma de presupuestos del mes */
  totalBudget: number;
  /** total de gastos del mes */
  totalSpent: number;
}

export async function getBudgetSummary(
  monthYear: string,
): Promise<BudgetSummary> {
  const budgetRows = await db
    .select({ total: sql<number>`coalesce(sum(${budgets.amount}), 0)` })
    .from(budgets)
    .where(eq(budgets.monthYear, monthYear));
  const spentRows = await db
    .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        like(transactions.date, `${monthYear}-%`),
        eq(transactions.type, 'expense'),
      ),
    );
  return {
    totalBudget: budgetRows[0]?.total ?? 0,
    totalSpent: spentRows[0]?.total ?? 0,
  };
}

/** Crea o actualiza el presupuesto de una categoría; con monto 0 lo elimina. */
export async function setBudgetAmount(
  categoryId: number,
  monthYear: string,
  amount: number,
): Promise<void> {
  const existing = await db
    .select()
    .from(budgets)
    .where(
      and(eq(budgets.categoryId, categoryId), eq(budgets.monthYear, monthYear)),
    );
  if (amount <= 0) {
    if (existing.length > 0) {
      await db.delete(budgets).where(eq(budgets.id, existing[0].id));
    }
    return;
  }
  if (existing.length > 0) {
    await db
      .update(budgets)
      .set({ amount })
      .where(eq(budgets.id, existing[0].id));
  } else {
    await db.insert(budgets).values({ categoryId, monthYear, amount });
  }
}
