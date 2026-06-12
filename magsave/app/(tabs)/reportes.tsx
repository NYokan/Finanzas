import { Pencil } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/CategoryIcon';
import { MonthlyBars } from '@/components/charts/MonthlyBars';
import { BudgetSheet, type BudgetSheetRef } from '@/components/sheets/BudgetSheet';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar, budgetColor } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/constants/colors';
import { useBudgetsWithUsage } from '@/hooks/useBudgets';
import { useAllCategories } from '@/hooks/useCategories';
import { useMonthlySeries, useStreak } from '@/hooks/useReports';
import { useExpensesByCategory } from '@/hooks/useTransactions';
import { formatMoney } from '@/utils/currency';
import { currentMonthYear, monthYearLabel } from '@/utils/dates';

const PERIODS = [3, 6, 12] as const;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(6);
  const monthYear = currentMonthYear();
  const budgetSheetRef = useRef<BudgetSheetRef>(null);

  const { data: series, loading: loadingSeries } = useMonthlySeries(period);
  const { data: byCategory } = useExpensesByCategory(monthYear);
  const { data: streak } = useStreak();
  const { data: budgets } = useBudgetsWithUsage(monthYear);
  const { data: categories } = useAllCategories();

  const insights = useMemo(() => {
    const points = series ?? [];
    const withExpense = points.filter((p) => p.expense > 0);
    const topMonth = withExpense.length
      ? withExpense.reduce((max, p) => (p.expense > max.expense ? p : max))
      : null;
    const avgExpense = withExpense.length
      ? withExpense.reduce((sum, p) => sum + p.expense, 0) / withExpense.length
      : 0;
    const topCategory = (byCategory ?? [])[0] ?? null;
    return { topMonth, avgExpense, topCategory };
  }, [series, byCategory]);

  const budgetByCategory = useMemo(
    () => new Map((budgets ?? []).map((b) => [b.categoryId, b])),
    [budgets],
  );
  const expenseCategories = (categories ?? []).filter(
    (c) => c.type === 'expense' || c.type === 'both',
  );

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-[28px] font-bold text-text-primary">Reportes</Text>

        {/* Selector de período */}
        <View className="mt-4 flex-row gap-2">
          {PERIODS.map((p) => (
            <Pill
              key={p}
              label={`${p} meses`}
              selected={period === p}
              onPress={() => setPeriod(p)}
            />
          ))}
        </View>

        {/* Gráfico de barras */}
        <Card style={{ marginTop: 16, alignItems: 'center' }}>
          {loadingSeries ? (
            <Skeleton height={240} radius={16} />
          ) : (
            <MonthlyBars data={series ?? []} />
          )}
        </Card>

        {/* Cards de insights */}
        <View className="mt-4 flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
          <View className="w-1/2 p-1.5">
            <Card style={{ minHeight: 96 }}>
              <Text className="text-xs text-text-secondary">Mes con más gasto</Text>
              <Text className="mt-1 text-base font-bold text-text-primary">
                {insights.topMonth
                  ? capitalize(monthYearLabel(insights.topMonth.monthYear).split(' ')[0])
                  : '—'}
              </Text>
              {insights.topMonth && (
                <Text className="text-sm" style={{ color: colors.danger }}>
                  {formatMoney(insights.topMonth.expense)}
                </Text>
              )}
            </Card>
          </View>
          <View className="w-1/2 p-1.5">
            <Card style={{ minHeight: 96 }}>
              <Text className="text-xs text-text-secondary">Categoría líder</Text>
              <Text className="mt-1 text-base font-bold text-text-primary" numberOfLines={1}>
                {insights.topCategory?.name ?? '—'}
              </Text>
              {insights.topCategory && (
                <Text className="text-sm text-text-secondary">
                  {formatMoney(insights.topCategory.total)} este mes
                </Text>
              )}
            </Card>
          </View>
          <View className="w-1/2 p-1.5">
            <Card style={{ minHeight: 96 }}>
              <Text className="text-xs text-text-secondary">Promedio mensual</Text>
              <Text className="mt-1 text-base font-bold text-text-primary">
                {insights.avgExpense > 0 ? formatMoney(insights.avgExpense) : '—'}
              </Text>
              <Text className="text-sm text-text-secondary">de gastos</Text>
            </Card>
          </View>
          <View className="w-1/2 p-1.5">
            <Card style={{ minHeight: 96 }}>
              <Text className="text-xs text-text-secondary">Racha</Text>
              <Text className="mt-1 text-base font-bold text-text-primary">
                {streak ?? 0} {streak === 1 ? 'día' : 'días'} seguidos 🔥
              </Text>
              <Text className="text-sm text-text-secondary">registrando gastos</Text>
            </Card>
          </View>
        </View>

        {/* Sección presupuesto */}
        <Text className="mt-6 text-xl font-semibold text-text-primary">
          Presupuestos del mes
        </Text>
        <Card style={{ marginTop: 12, paddingVertical: 6 }}>
          {expenseCategories.map((cat, index) => {
            const budget = budgetByCategory.get(cat.id);
            const progress =
              budget && budget.amount > 0 ? budget.spent / budget.amount : 0;
            return (
              <View
                key={cat.id}
                className="py-2.5"
                style={{
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}>
                <View className="flex-row items-center gap-3">
                  <CategoryIcon icon={cat.icon} color={cat.color} size={36} />
                  <Text className="flex-1 text-base font-medium text-text-primary">
                    {cat.name}
                  </Text>
                  {budget ? (
                    <Text className="text-sm text-text-secondary">
                      {formatMoney(budget.spent)} / {formatMoney(budget.amount)}
                    </Text>
                  ) : (
                    <Text className="text-sm italic text-text-secondary">
                      Sin presupuesto
                    </Text>
                  )}
                  <Pressable
                    onPress={() =>
                      budgetSheetRef.current?.open(cat, budget?.amount ?? 0)
                    }
                    hitSlop={8}
                    className="rounded-full p-1.5"
                    style={{ backgroundColor: colors.primaryDim }}>
                    <Pencil size={15} color={colors.primary} />
                  </Pressable>
                </View>
                {budget && budget.amount > 0 && (
                  <View className="ml-12 mt-2">
                    <ProgressBar
                      progress={progress}
                      height={7}
                      color={budgetColor(progress)}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </Card>
      </ScrollView>

      <BudgetSheet ref={budgetSheetRef} />
    </View>
  );
}
