import {
  createTransaction,
  deleteTransaction,
  getExpensesByCategory,
  getMonthTotals,
  getRecentTransactions,
  getTransactionsByMonth,
  updateTransaction,
} from '@/db/queries/transactions';
import type { NewTransaction } from '@/db/schema';
import { notifyDataChanged } from '@/stores/ui.store';

import { useDbQuery } from './useDbQuery';

export function useTransactionsByMonth(
  monthYear: string,
  filter: { type?: 'expense' | 'income'; categoryId?: number } = {},
) {
  return useDbQuery(
    () => getTransactionsByMonth(monthYear, filter),
    [monthYear, filter.type, filter.categoryId],
  );
}

export function useRecentTransactions(limit = 5) {
  return useDbQuery(() => getRecentTransactions(limit), [limit]);
}

export function useMonthTotals(monthYear: string) {
  return useDbQuery(() => getMonthTotals(monthYear), [monthYear]);
}

export function useExpensesByCategory(monthYear: string) {
  return useDbQuery(() => getExpensesByCategory(monthYear), [monthYear]);
}

export async function saveTransaction(
  data: NewTransaction,
  id?: number,
): Promise<void> {
  if (id != null) {
    await updateTransaction(id, data);
  } else {
    await createTransaction(data);
  }
  notifyDataChanged();
}

export async function removeTransaction(id: number): Promise<void> {
  await deleteTransaction(id);
  notifyDataChanged();
}
