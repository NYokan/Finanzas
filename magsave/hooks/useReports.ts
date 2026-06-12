import {
  getMonthlySeries,
  getRegisteredDates,
} from '@/db/queries/transactions';
import { computeStreak, currentMonthYear } from '@/utils/dates';

import { useDbQuery } from './useDbQuery';

export function useMonthlySeries(months: number) {
  return useDbQuery(
    () => getMonthlySeries(months, currentMonthYear()),
    [months],
  );
}

/** Días seguidos registrando transacciones. */
export function useStreak() {
  return useDbQuery(async () => computeStreak(await getRegisteredDates()));
}
