import { Pencil } from 'phosphor-react-native';
import { useMemo, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdviceCard } from '@/components/AdviceCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { BudgetSheet, type BudgetSheetRef } from '@/components/sheets/BudgetSheet';
import { Card } from '@/components/ui/Card';
import { ProgressBar, budgetColor } from '@/components/ui/ProgressBar';
import { colors, PASTELS } from '@/constants/colors';
import { tabBarClearance } from '@/constants/layout';
import { useAdvice } from '@/hooks/useAdvice';
import { useBudgetsWithUsage } from '@/hooks/useBudgets';
import { useAllCategories } from '@/hooks/useCategories';
import { useMonthlySeries, useStreak } from '@/hooks/useReports';
import { useExpensesByCategory } from '@/hooks/useTransactions';
import { formatMoney } from '@/utils/currency';
import { currentMonthYear, monthYearLabel } from '@/utils/dates';

// Ventana fija para los insights (el gráfico de barras se eliminó en v4)
const INSIGHT_MONTHS = 6;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Card pastel con borde glass para el grid de insights. */
function insightStyle(index: number) {
  return {
    minHeight: 112,
    backgroundColor: PASTELS[index % PASTELS.length],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  } as const;
}

export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const monthYear = currentMonthYear();
  const budgetSheetRef = useRef<BudgetSheetRef>(null);

  const { data: series } = useMonthlySeries(INSIGHT_MONTHS);
  const { data: byCategory } = useExpensesByCategory(monthYear);
  const { data: streak } = useStreak();
  const { data: budgets } = useBudgetsWithUsage(monthYear);
  const { data: categories } = useAllCategories();
  const { data: advice } = useAdvice();

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
          paddingBottom: tabBarClearance(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xl font-bold text-text-primary">Reportes</Text>
        <Text className="font-sans mt-0.5 text-sm text-text-secondary">
          Últimos {INSIGHT_MONTHS} meses
        </Text>

        {/* Grid de insights (cards pastel con borde glass) */}
        <View className="mt-4 flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
          <View className="w-1/2 p-1.5">
            <Card style={insightStyle(0)}>
              <Text className="font-sans text-xs font-medium text-text-secondary">
                Mes con más gasto
              </Text>
              <Text className="font-sans mt-1 text-lg font-bold text-text-primary">
                {insights.topMonth
                  ? capitalize(monthYearLabel(insights.topMonth.monthYear).split(' ')[0])
                  : '—'}
              </Text>
              {insights.topMonth && (
                <Text className="font-sans text-sm font-semibold" style={{ color: colors.danger }}>
                  {formatMoney(insights.topMonth.expense)}
                </Text>
              )}
            </Card>
          </View>
          <View className="w-1/2 p-1.5">
            <Card style={insightStyle(1)}>
              <Text className="font-sans text-xs font-medium text-text-secondary">
                Categoría líder
              </Text>
              <Text className="font-sans mt-1 text-lg font-bold text-text-primary" numberOfLines={1}>
                {insights.topCategory?.name ?? '—'}
              </Text>
              {insights.topCategory && (
                <Text className="font-sans text-sm text-text-secondary">
                  {formatMoney(insights.topCategory.total)} este mes
                </Text>
              )}
            </Card>
          </View>
          <View className="w-1/2 p-1.5">
            <Card style={insightStyle(2)}>
              <Text className="font-sans text-xs font-medium text-text-secondary">
                Promedio mensual
              </Text>
              <Text className="font-sans mt-1 text-lg font-bold text-text-primary">
                {insights.avgExpense > 0 ? formatMoney(insights.avgExpense) : '—'}
              </Text>
              <Text className="font-sans text-sm text-text-secondary">de gastos</Text>
            </Card>
          </View>
          <View className="w-1/2 p-1.5">
            <Card style={insightStyle(3)}>
              <Text className="font-sans text-xs font-medium text-text-secondary">Racha</Text>
              <Text className="font-sans mt-1 text-lg font-bold text-text-primary">
                {streak ?? 0} {streak === 1 ? 'día' : 'días'} 🔥
              </Text>
              <Text className="font-sans text-sm text-text-secondary">registrando gastos</Text>
            </Card>
          </View>
        </View>

        {/* Consejos del motor local */}
        {(advice ?? []).length > 0 && (
          <>
            <Text className="font-sans mt-6 text-xl font-semibold text-text-primary">
              Consejos para ti
            </Text>
            <View className="mt-3 gap-3">
              {(advice ?? []).map((a) => (
                <AdviceCard key={a.id} advice={a} />
              ))}
            </View>
          </>
        )}

        {/* Sección presupuesto */}
        <Text className="font-sans mt-6 text-xl font-semibold text-text-primary">
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
                  <Text className="font-sans flex-1 text-base font-medium text-text-primary">
                    {cat.name}
                  </Text>
                  {budget ? (
                    <Text className="font-sans text-sm text-text-secondary">
                      {formatMoney(budget.spent)} / {formatMoney(budget.amount)}
                    </Text>
                  ) : (
                    <Text className="font-sans text-sm italic text-text-secondary">
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
