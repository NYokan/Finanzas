import { desc, eq, sql } from 'drizzle-orm';

import { todayISO } from '@/utils/dates';

import { db } from '../client';
import {
  savingsContributions,
  savingsGoals,
  type NewSavingsGoal,
  type SavingsContribution,
  type SavingsGoal,
} from '../schema';

export type GoalWithProgress = SavingsGoal & {
  /** suma de aportes */
  saved: number;
};

export async function getGoalsWithProgress(): Promise<GoalWithProgress[]> {
  const rows = await db
    .select({
      goal: savingsGoals,
      saved: sql<number>`coalesce(sum(${savingsContributions.amount}), 0)`,
    })
    .from(savingsGoals)
    .leftJoin(
      savingsContributions,
      eq(savingsContributions.goalId, savingsGoals.id),
    )
    .groupBy(savingsGoals.id)
    .orderBy(savingsGoals.isCompleted, desc(savingsGoals.createdAt));
  return rows.map((r) => ({ ...r.goal, saved: r.saved }));
}

/** Total ahorrado entre todas las metas. */
export async function getTotalSaved(): Promise<number> {
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${savingsContributions.amount}), 0)`,
    })
    .from(savingsContributions);
  return rows[0]?.total ?? 0;
}

export async function getGoalContributions(
  goalId: number,
): Promise<SavingsContribution[]> {
  return db
    .select()
    .from(savingsContributions)
    .where(eq(savingsContributions.goalId, goalId))
    .orderBy(desc(savingsContributions.date), desc(savingsContributions.id));
}

export async function createGoal(data: NewSavingsGoal): Promise<void> {
  await db.insert(savingsGoals).values(data);
}

export async function updateGoal(
  id: number,
  data: Partial<NewSavingsGoal>,
): Promise<void> {
  await db.update(savingsGoals).set(data).where(eq(savingsGoals.id, id));
}

export async function deleteGoal(id: number): Promise<void> {
  await db
    .delete(savingsContributions)
    .where(eq(savingsContributions.goalId, id));
  await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
}

/**
 * Registra un aporte. Si con este aporte la meta llega a su objetivo,
 * la marca como completada y devuelve `justCompleted: true` para que la
 * UI dispare la celebración.
 */
export async function addContribution(
  goalId: number,
  amount: number,
  note?: string,
): Promise<{ justCompleted: boolean }> {
  await db.insert(savingsContributions).values({
    goalId,
    amount,
    note: note || null,
    date: todayISO(),
  });

  const goalRows = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.id, goalId));
  const goal = goalRows[0];
  if (!goal || goal.isCompleted) return { justCompleted: false };

  const totalRows = await db
    .select({
      total: sql<number>`coalesce(sum(${savingsContributions.amount}), 0)`,
    })
    .from(savingsContributions)
    .where(eq(savingsContributions.goalId, goalId));
  const saved = totalRows[0]?.total ?? 0;

  if (saved >= goal.targetAmount) {
    await db
      .update(savingsGoals)
      .set({ isCompleted: 1 })
      .where(eq(savingsGoals.id, goalId));
    return { justCompleted: true };
  }
  return { justCompleted: false };
}
