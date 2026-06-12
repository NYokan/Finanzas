import {
  addContribution,
  createGoal,
  deleteGoal,
  getGoalContributions,
  getGoalsWithProgress,
  getTotalSaved,
  updateGoal,
} from '@/db/queries/savings';
import type { NewSavingsGoal } from '@/db/schema';
import { notifyDataChanged } from '@/stores/ui.store';

import { useDbQuery } from './useDbQuery';

export function useSavingsGoals() {
  return useDbQuery(() => getGoalsWithProgress());
}

export function useTotalSaved() {
  return useDbQuery(() => getTotalSaved());
}

export function useGoalContributions(goalId: number | null) {
  return useDbQuery(
    () => (goalId == null ? Promise.resolve([]) : getGoalContributions(goalId)),
    [goalId],
  );
}

export async function saveGoal(
  data: NewSavingsGoal,
  id?: number,
): Promise<void> {
  if (id != null) {
    await updateGoal(id, data);
  } else {
    await createGoal(data);
  }
  notifyDataChanged();
}

export async function removeGoal(id: number): Promise<void> {
  await deleteGoal(id);
  notifyDataChanged();
}

export async function contribute(
  goalId: number,
  amount: number,
  note?: string,
): Promise<{ justCompleted: boolean }> {
  const result = await addContribution(goalId, amount, note);
  notifyDataChanged();
  return result;
}
