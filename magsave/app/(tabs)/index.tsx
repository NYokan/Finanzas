import { useRouter } from 'expo-router';
import { Plus, Warning } from 'phosphor-react-native';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionItem } from '@/components/TransactionItem';
import {
  AddActionSheet,
  type AddActionSheetRef,
} from '@/components/sheets/AddActionSheet';
import {
  TransactionSheet,
  type TransactionSheetRef,
} from '@/components/sheets/TransactionSheet';
import { Card } from '@/components/ui/Card';
import { ProgressBar, budgetColor } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, shadow } from '@/constants/colors';
import type { FixedExpenseWithStatus } from '@/db/queries/fixedExpenses';
import { useBudgetSummary } from '@/hooks/useBudgets';
import { useActiveFixedTotal, useFixedExpenses } from '@/hooks/useFixedExpenses';
import { useMonthTotals, useRecentTransactions } from '@/hooks/useTransactions';
import { formatMoney } from '@/utils/currency';
import {
  currentMonthYear,
  daysInMonth,
  fullDateLabel,
  greeting,
  relativeDateLabel,
} from '@/utils/dates';

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
      // pendiente este mes
      const daysLeft = dueDay - today;
      if (daysLeft >= 0 && daysLeft <= 7) result.push({ expense: item, daysLeft });
    } else {
      // ya pagado este mes: mirar el vencimiento del mes que viene
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
  const { data: fixedTotal, loading: loadingFixed } = useActiveFixedTotal();
  const { data: budget, loading: loadingBudget } = useBudgetSummary(monthYear);
  const { data: fixedExpenses } = useFixedExpenses(monthYear);
  const { data: recent, loading: loadingRecent } = useRecentTransactions(5);

  const addSheetRef = useRef<AddActionSheetRef>(null);
  const txSheetRef = useRef<TransactionSheetRef>(null);

  const loading = loadingTotals || loadingFixed || loadingBudget;
  const available =
    (totals?.income ?? 0) - (totals?.expense ?? 0) - (fixedTotal ?? 0);
  const spent = budget?.totalSpent ?? 0;
  const totalBudget = budget?.totalBudget ?? 0;
  const budgetProgress = totalBudget > 0 ? spent / totalBudget : 0;
  const upcoming = upcomingFixedExpenses(fixedExpenses ?? []);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text className="text-[28px] font-bold text-text-primary">
          {greeting(USER_NAME)}
        </Text>
        <Text className="mt-1 text-base text-text-secondary">
          {fullDateLabel(new Date())}
        </Text>

        {/* Card principal: saldo del mes */}
        <Card style={{ marginTop: 20, backgroundColor: colors.primaryDim }}>
          <Text className="text-sm text-text-secondary">Disponible este mes</Text>
          {loading ? (
            <Skeleton width={180} height={40} style={{ marginTop: 8 }} />
          ) : (
            <View className="mt-1 flex-row items-center gap-2">
              {available < 0 && <Warning size={28} color={colors.danger} />}
              <Text
                className="text-[40px] font-bold"
                style={{ color: available < 0 ? colors.danger : colors.textPrimary }}>
                {formatMoney(available)}
              </Text>
            </View>
          )}
          {!loading && totalBudget > 0 && (
            <Text className="mt-1 text-sm text-text-secondary">
              Llevas gastado {formatMoney(spent)} de {formatMoney(totalBudget)}{' '}
              presupuestados
            </Text>
          )}
        </Card>

        {/* Barra de progreso de presupuesto */}
        {!loading && totalBudget > 0 && (
          <Card style={{ marginTop: 14 }}>
            <View className="flex-row justify-between">
              <Text className="text-sm font-medium text-text-primary">
                Presupuesto del mes
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: budgetColor(budgetProgress) }}>
                {Math.round(budgetProgress * 100)}%
              </Text>
            </View>
            <View className="mt-2">
              <ProgressBar
                progress={budgetProgress}
                color={budgetColor(budgetProgress)}
              />
            </View>
            <Text className="mt-2 text-sm text-text-secondary">
              {totalBudget - spent >= 0
                ? `Quedan ${formatMoney(totalBudget - spent)} para el resto del mes`
                : `Te pasaste por ${formatMoney(spent - totalBudget)} este mes`}
            </Text>
          </Card>
        )}

        {/* Próximos gastos fijos */}
        {upcoming.length > 0 && (
          <View className="mt-6">
            <Text className="text-xl font-semibold text-text-primary">
              Próximos gastos fijos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
              {upcoming.map(({ expense, daysLeft }) => (
                <Card key={expense.id} style={{ width: 150, padding: 14 }}>
                  <Text
                    className="text-sm font-semibold text-text-primary"
                    numberOfLines={1}>
                    {expense.name}
                  </Text>
                  <Text className="mt-1 text-base font-bold text-text-primary">
                    {formatMoney(expense.amount)}
                  </Text>
                  <Text
                    className="mt-1 text-xs font-semibold"
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
        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-text-primary">
              Últimas transacciones
            </Text>
            <Pressable onPress={() => router.push('/gastos')} hitSlop={8}>
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                Ver todo
              </Text>
            </Pressable>
          </View>
          <Card style={{ marginTop: 12 }}>
            {loadingRecent ? (
              <View className="gap-3 py-2">
                <Skeleton height={40} radius={12} />
                <Skeleton height={40} radius={12} />
                <Skeleton height={40} radius={12} />
              </View>
            ) : (recent ?? []).length === 0 ? (
              <Text className="py-4 text-center text-sm text-text-secondary">
                Aún no registras nada este mes.{'\n'}Toca el + para empezar 💪
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
          </Card>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => addSheetRef.current?.open()}
        className="absolute items-center justify-center rounded-full active:opacity-80"
        style={[
          shadow,
          {
            bottom: 24,
            alignSelf: 'center',
            width: 60,
            height: 60,
            backgroundColor: colors.primary,
          },
        ]}>
        <Plus size={30} color="#FFFFFF" weight="bold" />
      </Pressable>

      <AddActionSheet
        ref={addSheetRef}
        onSelect={(type) => txSheetRef.current?.open({ type })}
      />
      <TransactionSheet ref={txSheetRef} />
    </View>
  );
}
