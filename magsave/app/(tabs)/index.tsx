import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, Plus, TrendDown, TrendUp } from 'phosphor-react-native';
import { useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categoryIconComponent } from '@/components/CategoryIcon';
import { TransactionItem } from '@/components/TransactionItem';
import { DonutChart } from '@/components/charts/DonutChart';
import {
  AddActionSheet,
  type AddActionSheetRef,
} from '@/components/sheets/AddActionSheet';
import {
  TransactionSheet,
  type TransactionSheetRef,
} from '@/components/sheets/TransactionSheet';
import { BalanceHeader } from '@/components/ui/BalanceHeader';
import { Card } from '@/components/ui/Card';
import { GlassMetricCard } from '@/components/ui/GlassMetricCard';
import { ProgressBar, budgetColor } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, shadow } from '@/constants/colors';
import type { FixedExpenseWithStatus } from '@/db/queries/fixedExpenses';
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

  const addSheetRef = useRef<AddActionSheetRef>(null);
  const txSheetRef = useRef<TransactionSheetRef>(null);

  const loading = loadingTotals || loadingBudget;
  const spent = budget?.totalSpent ?? 0;
  const totalBudget = budget?.totalBudget ?? 0;
  const hasBudget = totalBudget > 0;
  const budgetProgress = hasBudget ? spent / totalBudget : 0;
  const remaining = totalBudget - spent;
  const available =
    (totals?.income ?? 0) - (totals?.expense ?? 0) - (fixedTotal ?? 0);
  const upcoming = upcomingFixedExpenses(fixedExpenses ?? []);
  const topCategories = (byCategory ?? []).slice(0, 5);

  const onBellPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await ensureNotificationPermissions();
    Alert.alert(
      granted ? 'Recordatorios activos 💜' : 'Notificaciones apagadas',
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
        <View className="flex-row items-center justify-between px-5">
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

        {/* Presupuesto + dona */}
        <View className="mt-7 px-5">
          {loading ? (
            <Skeleton height={80} radius={20} />
          ) : (
            <BalanceHeader
              label={
                hasBudget
                  ? `Presupuesto de ${monthYearLabel(monthYear)}`
                  : 'Gastado este mes'
              }
              amount={hasBudget ? totalBudget : spent}
              badge={
                hasBudget
                  ? remaining >= 0
                    ? {
                        text: `Quedan ${formatMoney(remaining)}`,
                        color: budgetColor(budgetProgress),
                      }
                    : {
                        text: `Te pasaste por ${formatMoney(-remaining)}`,
                        color: colors.danger,
                        bg: colors.dangerDim,
                      }
                  : {
                      text: 'Define presupuestos en Reportes',
                    }
              }
              right={
                topCategories.length > 0 ? (
                  <DonutChart
                    data={topCategories.map((c) => ({ value: c.total, color: c.color }))}
                    size={110}
                    holeColor={colors.bg}
                    centerLabel={
                      hasBudget ? `${Math.round(budgetProgress * 100)}%` : undefined
                    }
                    centerSublabel={hasBudget ? 'usado' : undefined}
                  />
                ) : undefined
              }
            />
          )}
          {!loading && hasBudget && (
            <View className="mt-3">
              <ProgressBar
                progress={budgetProgress}
                color={budgetColor(budgetProgress)}
                trackColor={colors.surfaceAlt}
              />
            </View>
          )}
        </View>

        {/* Carrusel de categorías del mes */}
        {topCategories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-6"
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
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

        {/* Bloques de ingresos / gastos del mes */}
        <View className="mt-6 flex-row gap-3 px-5">
          <Card style={{ flex: 1 }}>
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 38, height: 38, backgroundColor: colors.successDim }}>
              <TrendUp size={20} color={colors.success} />
            </View>
            <Text className="font-sans mt-3 text-sm text-text-secondary">Ingresos</Text>
            <Text className="font-sans text-lg font-bold text-text-primary">
              {formatMoney(totals?.income ?? 0)}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 38, height: 38, backgroundColor: colors.dangerDim }}>
              <TrendDown size={20} color={colors.danger} />
            </View>
            <Text className="font-sans mt-3 text-sm text-text-secondary">Gastos</Text>
            <Text className="font-sans text-lg font-bold text-text-primary">
              {formatMoney(totals?.expense ?? 0)}
            </Text>
          </Card>
        </View>

        {/* Disponible del mes */}
        {!loading && (
          <View className="mt-3 px-5">
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="font-sans text-sm text-text-secondary">
                  Disponible (descontando fijos)
                </Text>
                <Text
                  className="font-sans text-base font-bold"
                  style={{ color: available < 0 ? colors.danger : colors.success }}>
                  {formatMoney(available)}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Próximos gastos fijos */}
        {upcoming.length > 0 && (
          <View className="mt-6">
            <Text className="font-sans px-5 text-lg font-semibold text-text-primary">
              Próximos gastos fijos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
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
        <View className="mt-6 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans text-lg font-semibold text-text-primary">
              Últimas transacciones
            </Text>
            <Pressable onPress={() => router.push('/gastos')} hitSlop={8}>
              <Text
                className="font-sans text-sm font-semibold"
                style={{ color: colors.primaryLight }}>
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
          </View>
        </View>
      </ScrollView>

      {/* FAB (sobre el navbar flotante) */}
      <Pressable
        onPress={() => addSheetRef.current?.open()}
        className="absolute items-center justify-center rounded-full active:opacity-80"
        style={[
          shadow,
          {
            bottom: 110,
            right: 20,
            width: 58,
            height: 58,
            backgroundColor: colors.primary,
          },
        ]}>
        <Plus size={28} color="#FFFFFF" weight="bold" />
      </Pressable>

      <AddActionSheet
        ref={addSheetRef}
        onSelect={(type) => txSheetRef.current?.open({ type })}
      />
      <TransactionSheet ref={txSheetRef} />
    </View>
  );
}
