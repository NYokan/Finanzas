import { asc, inArray } from 'drizzle-orm';

import { db } from '../client';
import { categories, type Category } from '../schema';

export async function getAllCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.id));
}

/** Categorías válidas para un tipo de transacción (incluye las "both"). */
export async function getCategoriesForType(
  type: 'expense' | 'income',
): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(inArray(categories.type, [type, 'both']))
    .orderBy(asc(categories.id));
}
