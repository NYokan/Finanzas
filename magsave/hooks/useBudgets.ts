import {
  getBudgetSummary,
  getBudgetsWithUsage,
  setBudgetAmount,
} from '@/db/queries/budgets';
import { notifyDataChanged } from '@/stores/ui.store';

import { useDbQuery } from './useDbQuery';

export function useBudgetsWithUsage(monthYear: string) {
  return useDbQuery(() => getBudgetsWithUsage(monthYear), [monthYear]);
}

export function useBudgetSummary(monthYear: string) {
  return useDbQuery(() => getBudgetSummary(monthYear), [monthYear]);
}

export async function saveBudget(
  categoryId: number,
  monthYear: string,
  amount: number,
): Promise<void> {
  await setBudgetAmount(categoryId, monthYear, amount);
  notifyDataChanged();
}
