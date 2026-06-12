import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Categorías (precargadas en el seed; is_default = 1 → no borrable)
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull(), // nombre del ícono lucide (PascalCase)
  color: text('color').notNull(), // hex
  type: text('type', { enum: ['expense', 'income', 'both'] }).notNull(),
  isDefault: integer('is_default').default(1),
});

// Transacciones (gastos e ingresos variables)
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['expense', 'income'] }).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  note: text('note'),
  date: text('date').notNull(), // ISO 8601: "2024-03-15"
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Gastos fijos mensuales
export const fixedExpenses = sqliteTable('fixed_expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  dayOfMonth: integer('day_of_month').notNull(), // 1-31
  categoryId: integer('category_id').references(() => categories.id),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Control mensual de gastos fijos (qué meses fueron pagados)
export const fixedExpensePayments = sqliteTable('fixed_expense_payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fixedExpenseId: integer('fixed_expense_id').references(() => fixedExpenses.id),
  monthYear: text('month_year').notNull(), // "2024-03"
  paidAt: text('paid_at'), // null = pendiente
});

// Metas de ahorro
export const savingsGoals = sqliteTable('savings_goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  targetAmount: real('target_amount').notNull(),
  deadline: text('deadline'), // ISO date, nullable
  isCompleted: integer('is_completed').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Aportes a metas de ahorro
export const savingsContributions = sqliteTable('savings_contributions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  goalId: integer('goal_id').references(() => savingsGoals.id),
  amount: real('amount').notNull(),
  note: text('note'),
  date: text('date').notNull(),
});

// Presupuesto mensual por categoría
export const budgets = sqliteTable('budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id),
  amount: real('amount').notNull(),
  monthYear: text('month_year').notNull(), // "2024-03"
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type NewFixedExpense = typeof fixedExpenses.$inferInsert;
export type FixedExpensePayment = typeof fixedExpensePayments.$inferSelect;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type NewSavingsGoal = typeof savingsGoals.$inferInsert;
export type SavingsContribution = typeof savingsContributions.$inferSelect;
export type NewSavingsContribution = typeof savingsContributions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
