import { getBudgetSummary } from '@/db/queries/budgets';
import { getActiveFixedTotal } from '@/db/queries/fixedExpenses';
import { getGoalsWithProgress } from '@/db/queries/savings';
import {
  getExpensesByCategory,
  getMonthTotals,
  getRegisteredDates,
  getTransactionsByMonth,
} from '@/db/queries/transactions';
import { buildAdvice, type Advice } from '@/utils/advisor';
import { currentMonthYear, shiftMonthYear } from '@/utils/dates';

import { useDbQuery } from './useDbQuery';

/** Junta los agregados de SQLite y corre el motor de consejos local. */
export function useAdvice() {
  const monthYear = currentMonthYear();
  return useDbQuery<Advice[]>(async () => {
    const prevMonth = shiftMonthYear(monthYear, -1);
    const [
      byCategoryNow,
      byCategoryPrev,
      budget,
      fixedTotal,
      monthTotals,
      goals,
      registeredDates,
      monthExpenses,
    ] = await Promise.all([
      getExpensesByCategory(monthYear),
      getExpensesByCategory(prevMonth),
      getBudgetSummary(monthYear),
      getActiveFixedTotal(),
      getMonthTotals(monthYear),
      getGoalsWithProgress(),
      getRegisteredDates(),
      getTransactionsByMonth(monthYear, { type: 'expense' }),
    ]);
    return buildAdvice({
      now: new Date(),
      byCategoryNow,
      byCategoryPrev,
      budget,
      fixedTotal,
      monthTotals,
      goals,
      registeredDates,
      monthExpenses,
    });
  }, [monthYear]);
}
