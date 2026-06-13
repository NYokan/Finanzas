import { and, eq } from 'drizzle-orm';

import { db } from './client';
import { categories, type NewCategory } from './schema';

// Categorías por defecto del spec. El ícono es el nombre PascalCase
// del componente en phosphor-react-native. Colores pastel (v4): legibles
// como acento sobre blanco y como slice de la dona.
const DEFAULT_CATEGORIES: NewCategory[] = [
  { name: 'Comida', icon: 'Pizza', color: '#F2789F', type: 'expense', isDefault: 1 },
  { name: 'Transporte', icon: 'Bus', color: '#F0A884', type: 'expense', isDefault: 1 },
  { name: 'Hogar', icon: 'House', color: '#E5B769', type: 'expense', isDefault: 1 },
  { name: 'Salud', icon: 'Pill', color: '#C49BD6', type: 'expense', isDefault: 1 },
  { name: 'Ocio', icon: 'FilmSlate', color: '#F6C56C', type: 'expense', isDefault: 1 },
  { name: 'Ropa', icon: 'TShirt', color: '#F08FB8', type: 'expense', isDefault: 1 },
  { name: 'Mascotas', icon: 'PawPrint', color: '#C9A284', type: 'expense', isDefault: 1 },
  { name: 'Educación', icon: 'BookOpen', color: '#9FB8E0', type: 'expense', isDefault: 1 },
  { name: 'Trabajo', icon: 'Briefcase', color: '#8FC9A8', type: 'income', isDefault: 1 },
  { name: 'Otro', icon: 'Gift', color: '#B8B0A8', type: 'both', isDefault: 1 },
];

/**
 * Inserta las categorías por defecto si la tabla está vacía y, si ya
 * existen, sincroniza sus colores con la paleta vigente (el color vive
 * en SQLite, así que un cambio de paleta no llega solo con el seed).
 */
export async function seedDatabase() {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length === 0) {
    await db.insert(categories).values(DEFAULT_CATEGORIES);
    return;
  }
  for (const cat of DEFAULT_CATEGORIES) {
    await db
      .update(categories)
      .set({ color: cat.color })
      .where(and(eq(categories.name, cat.name), eq(categories.isDefault, 1)));
  }
}
