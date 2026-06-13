import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell } from 'phosphor-react-native';
import { useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdviceCard } from '@/components/AdviceCard';
import { categoryIconComponent } from '@/components/CategoryIcon';
import { TransactionItem } from '@/components/TransactionItem';
import { DonutChart } from '@/components/charts/DonutChart';
import {
  TransactionSheet,
  type TransactionSheetRef,
} from '@/components/sheets/TransactionSheet';
import { Card } from '@/components/ui/Card';
import { GlassMetricCard } from '@/components/ui/GlassMetricCard';
import { HeroBalanceCard } from '@/components/ui/HeroBalanceCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/constants/colors';
import type { FixedExpenseWithStatus } from '@/db/queries/fixedExpenses';
import { useAdvice } from '@/hooks/useAdvice';
import { useBudgetSummary } from '@/hooks/useBudgets';
import { useActiveFixedTotal, useFixedExpenses } from '@/hooks/useFixedExpenses';
import {
  useExpensesByCategory,
  useMonthTotals,
  useRecentTransactions,
} from '@/hooks/useTransactions';
import { formatMoney } from '@/utils/currency';
import {
  currentMonthYear,
  daysInMonth,
  fullDateLabel,
  monthYearLabel,
  relativeDateLabel,
} from '@/utils/dates';
import { ensureNotificationPermissions } from '@/utils/notifications';

const USER_NAME = 'Magda';

interface UpcomingFixed {
  expense: FixedExpenseWithStatus;
  daysLeft: number;
}

/** Gastos fijos pendientes que vencen en los próximos 7 días. */
function upcomingFixedExpenses(
  items: FixedExpenseWithStatus[],
  now: Date = new Date(),
): UpcomingFixed[] {
  const today = now.getDate();
  const lastDay = daysInMonth(now.getFullYear(), now.getMonth());
  const result: UpcomingFixed[] = [];
  for (const item of items) {
    const dueDay = Math.min(item.dayOfMonth, lastDay);
    if (!item.paidAt) {
      const daysLeft = dueDay - today;
      if (daysLeft >= 0 && daysLeft <= 7) result.push({ expense: item, daysLeft });
    } else {
      const nextLast = daysInMonth(now.getFullYear(), now.getMonth() + 1);
      const daysLeft = lastDay - today + Math.min(item.dayOfMonth, nextLast);
      if (daysLeft <= 7) result.push({ expense: item, daysLeft });
    }
  }
  return result.sort((a, b) => a.daysLeft - b.daysLeft);
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const monthYear = currentMonthYear();

  const { data: totals, loading: loadingTotals } = useMonthTotals(monthYear);
  const { data: fixedTotal } = useActiveFixedTotal();
  const { data: budget, loading: loadingBudget } = useBudgetSummary(monthYear);
  const { data: byCategory } = useExpensesByCategory(monthYear);
  const { data: fixedExpenses } = useFixedExpenses(monthYear);
  const { data: recent, loading: loadingRecent } = useRecentTransactions(5);
  const { data: advice } = useAdvice();

  const txSheetRef = useRef<TransactionSheetRef>(null);

  const loading = loadingTotals || loadingBudget;
  const spent = budget?.totalSpent ?? 0;
  const totalBudget = budget?.totalBudget ?? 0;
  const hasBudget = totalBudget > 0;
  const budgetProgress = hasBudget ? spent / totalBudget : 0;
  const available =
    (totals?.income ?? 0) - (totals?.expense ?? 0) - (fixedTotal ?? 0);
  const upcoming = upcomingFixedExpenses(fixedExpenses ?? []);
  const topCategories = (byCategory ?? []).slice(0, 5);

  const onBellPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await ensureNotificationPermissions();
    Alert.alert(
      granted ? 'Recordatorios activos 💗' : 'Notificaciones apagadas',
      granted
        ? 'Te aviso un día antes de cada gasto fijo.'
        : 'Actívalas en los ajustes del teléfono para no perderte ningún vencimiento.',
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Saludo */}
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text className="font-sans text-lg font-bold text-white">
                {USER_NAME.charAt(0)}
              </Text>
            </LinearGradient>
            <View>
              <Text className="font-sans text-sm text-text-secondary">
                {fullDateLabel(new Date())}
              </Text>
              <Text className="font-sans text-xl font-bold text-text-primary">
                Hola, {USER_NAME} 👋
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onBellPress}
            hitSlop={8}
            className="items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: colors.surface }}>
            <Bell size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Hero: disponible + presupuesto + acciones rápidas */}
        <View className="px-6" style={{ marginTop: 28 }}>
          {loading ? (
            <Skeleton height={260} radius={24} />
          ) : (
            <HeroBalanceCard
              label={`Disponible en ${monthYearLabel(monthYear)}`}
              amount={available}
              budgetTotal={hasBudget ? totalBudget : undefined}
              income={totals?.income ?? 0}
              expense={spent}
              onAddExpense={() => txSheetRef.current?.open({ type: 'expense' })}
              onAddIncome={() => txSheetRef.current?.open({ type: 'income' })}
            />
          )}
        </View>

        {/* Primer consejo del motor local, como banner discreto */}
        {(advice ?? []).length > 0 && (
          <View className="px-6" style={{ marginTop: 20 }}>
            <AdviceCard advice={(advice ?? [])[0]} compact />
          </View>
        )}

        {/* Carrusel de categorías del mes */}
        {topCategories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 24 }}
            // paddingVertical para que Android no recorte las sombras de las cards
            contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
            {topCategories.map((cat) => (
              <GlassMetricCard
                key={`${cat.categoryId}`}
                icon={categoryIconComponent(cat.icon)}
                title={cat.name}
                amount={formatMoney(cat.total)}
                badge={spent > 0 ? `${Math.round((cat.total / spent) * 100)}%` : undefined}
                accentColor={cat.color}
                onPress={() => router.push('/gastos')}
              />
            ))}
          </ScrollView>
        )}

        {/* Dona de gastos por categoría, ancho completo con leyenda */}
        {topCategories.length > 0 && (
          <View className="px-6" style={{ marginTop: 24 }}>
            <Card>
              <Text className="font-sans text-base font-semibold text-text-primary">
                Gastos por categoría
              </Text>
              <View className="mt-3 flex-row items-center gap-5">
                <DonutChart
                  data={topCategories.map((c) => ({ value: c.total, color: c.color }))}
                  size={120}
                  holeColor={colors.surface}
                  centerLabel={
                    hasBudget ? `${Math.round(budgetProgress * 100)}%` : undefined
                  }
                  centerSublabel={hasBudget ? 'usado' : undefined}
                />
                <View className="flex-1 gap-2">
                  {topCategories.map((cat) => (
                    <View key={`${cat.categoryId}`} className="flex-row items-center gap-2">
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: cat.color,
                        }}
                      />
                      <Text
                        className="font-sans flex-1 text-sm text-text-secondary"
                        numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <Text className="font-sans text-sm font-semibold text-text-primary">
                        {formatMoney(cat.total)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Próximos gastos fijos */}
        {upcoming.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Text className="font-sans px-6 text-lg font-semibold text-text-primary">
              Próximos gastos fijos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-1"
              contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
              {upcoming.map(({ expense, daysLeft }) => (
                <Card key={expense.id} style={{ width: 150, padding: 14 }}>
                  <Text
                    className="font-sans text-sm font-semibold text-text-primary"
                    numberOfLines={1}>
                    {expense.name}
                  </Text>
                  <Text className="font-sans mt-1 text-base font-bold text-text-primary">
                    {formatMoney(expense.amount)}
                  </Text>
                  <Text
                    className="font-sans mt-1 text-xs font-semibold"
                    style={{
                      color: daysLeft === 0 ? colors.danger : colors.textSecondary,
                    }}>
                    {daysLeft === 0
                      ? '¡Hoy!'
                      : daysLeft === 1
                        ? 'Mañana'
                        : `En ${daysLeft} días`}
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Últimas transacciones */}
        <View className="px-6" style={{ marginTop: 28 }}>
          <View className="flex-row items-center justify-between">
            <Text className="font-sans text-lg font-semibold text-text-primary">
              Últimas transacciones
            </Text>
            <Pressable onPress={() => router.push('/gastos')} hitSlop={8}>
              <Text
                className="font-sans text-sm font-semibold"
                style={{ color: colors.primary }}>
                Ver todo
              </Text>
            </Pressable>
          </View>
          <View className="mt-3">
            {loadingRecent ? (
              <View className="gap-3 py-2">
                <Skeleton height={48} radius={14} />
                <Skeleton height={48} radius={14} />
                <Skeleton height={48} radius={14} />
              </View>
            ) : (recent ?? []).length === 0 ? (
              <Text className="font-sans py-4 text-center text-sm text-text-secondary">
                Aún no registras nada este mes.{'\n'}
                Parte con los botones de arriba 💪
              </Text>
            ) : (
              (recent ?? []).map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  meta={relativeDateLabel(tx.date)}
                  onPress={() =>
                    txSheetRef.current?.open({ type: tx.type, transaction: tx })
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <TransactionSheet ref={txSheetRef} />
    </View>
  );
}
