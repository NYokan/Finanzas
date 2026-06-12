import { getAllCategories, getCategoriesForType } from '@/db/queries/categories';

import { useDbQuery } from './useDbQuery';

export function useAllCategories() {
  return useDbQuery(() => getAllCategories());
}

export function useCategoriesForType(type: 'expense' | 'income') {
  return useDbQuery(() => getCategoriesForType(type), [type]);
}
