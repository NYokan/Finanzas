import { db } from './client';
import { categories, type NewCategory } from './schema';

// Categorías por defecto del spec. El ícono es el nombre PascalCase
// del componente en lucide-react-native.
const DEFAULT_CATEGORIES: NewCategory[] = [
  { name: 'Comida', icon: 'Pizza', color: '#E8593C', type: 'expense', isDefault: 1 },
  { name: 'Transporte', icon: 'Bus', color: '#378ADD', type: 'expense', isDefault: 1 },
  { name: 'Hogar', icon: 'House', color: '#1D9E75', type: 'expense', isDefault: 1 },
  { name: 'Salud', icon: 'Pill', color: '#9B59B6', type: 'expense', isDefault: 1 },
  { name: 'Ocio', icon: 'Clapperboard', color: '#F39C12', type: 'expense', isDefault: 1 },
  { name: 'Ropa', icon: 'Shirt', color: '#E91E63', type: 'expense', isDefault: 1 },
  { name: 'Mascotas', icon: 'PawPrint', color: '#8D6E63', type: 'expense', isDefault: 1 },
  { name: 'Educación', icon: 'BookOpen', color: '#3F51B5', type: 'expense', isDefault: 1 },
  { name: 'Trabajo', icon: 'Briefcase', color: '#1D9E75', type: 'income', isDefault: 1 },
  { name: 'Otro', icon: 'Gift', color: '#888780', type: 'both', isDefault: 1 },
];

/** Inserta las categorías por defecto solo si la tabla está vacía. */
export async function seedDatabase() {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length > 0) return;
  await db.insert(categories).values(DEFAULT_CATEGORIES);
}
