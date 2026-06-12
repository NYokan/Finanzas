import {
  createFixedExpense,
  deleteFixedExpense,
  getActiveFixedTotal,
  getFixedExpenses,
  markPaid,
  unmarkPaid,
  updateFixedExpense,
} from '@/db/queries/fixedExpenses';
import type { FixedExpense, NewFixedExpense } from '@/db/schema';
import { notifyDataChanged } from '@/stores/ui.store';
import {
  cancelFixedExpenseReminder,
  scheduleFixedExpenseReminder,
} from '@/utils/notifications';

import { useDbQuery } from './useDbQuery';

export function useFixedExpenses(monthYear: string) {
  return useDbQuery(() => getFixedExpenses(monthYear), [monthYear]);
}

export function useActiveFixedTotal() {
  return useDbQuery(() => getActiveFixedTotal());
}

export async function saveFixedExpense(
  data: NewFixedExpense,
  id?: number,
): Promise<void> {
  let saved: FixedExpense;
  if (id != null) {
    await updateFixedExpense(id, data);
    saved = { id, ...data } as FixedExpense;
    await cancelFixedExpenseReminder(id);
  } else {
    saved = await createFixedExpense(data);
  }
  if (data.isActive !== 0) {
    await scheduleFixedExpenseReminder(saved.id, data.name, data.amount, data.dayOfMonth);
  }
  notifyDataChanged();
}

export async function removeFixedExpense(id: number): Promise<void> {
  await cancelFixedExpenseReminder(id);
  await deleteFixedExpense(id);
  notifyDataChanged();
}

export async function setPaid(
  fixedExpenseId: number,
  monthYear: string,
  paid: boolean,
): Promise<void> {
  if (paid) {
    await markPaid(fixedExpenseId, monthYear);
  } else {
    await unmarkPaid(fixedExpenseId, monthYear);
  }
  notifyDataChanged();
}
