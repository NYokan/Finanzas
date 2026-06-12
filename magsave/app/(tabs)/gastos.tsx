import * as Haptics from 'expo-haptics';
import { CaretLeft, CaretRight, Trash } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionItem } from '@/components/TransactionItem';
import { CategoryPie } from '@/components/charts/CategoryPie';
import {
  TransactionSheet,
  type TransactionSheetRef,
} from '@/components/sheets/TransactionSheet';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pill } from '@/components/ui/Pill';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/constants/colors';
import type { TransactionWithCategory } from '@/db/queries/transactions';
import { useAllCategories } from '@/hooks/useCategories';
import {
  removeTransaction,
  useExpensesByCategory,
  useMonthTotals,
  useTransactionsByMonth,
} from '@/hooks/useTransactions';
import { formatMoney } from '@/utils/currency';
import {
  currentMonthYear,
  dateGroupLabel,
  monthYearLabel,
  shiftMonthYear,
  timeLabel,
} from '@/utils/dates';

interface DateGroup {
  date: string;
  label: string;
  items: TransactionWithCategory[];
}

function groupByDate(items: TransactionWithCategory[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const tx of items) {
    const last = groups[groups.length - 1];
    if (last && last.date === tx.date) {
      last.items.push(tx);
    } else {
      groups.push({ date: tx.date, label: dateGroupLabel(tx.date), items: [tx] });
    }
  }
  return groups;
}

export default function GastosScreen() {
  const insets = useSafeAreaInsets();
  const [monthYear, setMonthYear] = useState(currentMonthYear());
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const txSheetRef = useRef<TransactionSheetRef>(null);

  const { data: transactions, loading } = useTransactionsByMonth(monthYear, {
    categoryId,
  });
  const { data: byCategory } = useExpensesByCategory(monthYear);
  const { data: totals } = useMonthTotals(monthYear);
  const { data: categories } = useAllCategories();

  const groups = useMemo(
    () => groupByDate(transactions ?? []),
    [transactions],
  );

  const confirmDelete = (tx: TransactionWithCategory) => {
    Alert.alert(
      '¿Eliminar transacción?',
      `Se borrará ${tx.type === 'expense' ? 'el gasto' : 'el ingreso'} de ${formatMoney(tx.amount)}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(tx.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error(error);
              Alert.alert('Ups', 'No se pudo eliminar. Inténtalo de nuevo.');
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Selector de mes */}
        <View className="flex-row items-center justify-between px-5">
          <Pressable
            onPress={() => setMonthYear(shiftMonthYear(monthYear, -1))}
            hitSlop={10}
            className="rounded-full bg-surface p-2">
            <CaretLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <Text className="text-xl font-semibold capitalize text-text-primary">
            {monthYearLabel(monthYear)}
          </Text>
          <Pressable
            onPress={() => setMonthYear(shiftMonthYear(monthYear, 1))}
            hitSlop={10}
            className="rounded-full bg-surface p-2">
            <CaretRight size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Filtro por categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          <Pill
            label="Todas"
            selected={categoryId === undefined}
            onPress={() => setCategoryId(undefined)}
          />
          {(categories ?? []).map((cat) => (
            <Pill
              key={cat.id}
              label={cat.name}
              color={cat.color}
              selected={categoryId === cat.id}
              onPress={() =>
                setCategoryId(categoryId === cat.id ? undefined : cat.id)
              }
            />
          ))}
        </ScrollView>

        {/* Resumen del mes */}
        <View className="mt-4 px-5">
          <Card>
            <Text className="text-sm text-text-secondary">Total gastado</Text>
            <Text className="mt-1 text-3xl font-bold" style={{ color: colors.danger }}>
              {formatMoney(totals?.expense ?? 0)}
            </Text>
            {(byCategory ?? []).length > 0 && (
              <View className="mt-2">
                <CategoryPie data={byCategory ?? []} />
              </View>
            )}
          </Card>
        </View>

        {/* Lista agrupada por fecha */}
        <View className="mt-2 px-5">
          {loading ? (
            <View className="mt-4 gap-3">
              <Skeleton height={48} radius={14} />
              <Skeleton height={48} radius={14} />
              <Skeleton height={48} radius={14} />
            </View>
          ) : groups.length === 0 ? (
            <EmptyState
              emoji="🌱"
              title="Nada por aquí todavía"
              subtitle="Lo que registres este mes va a aparecer en esta lista"
            />
          ) : (
            groups.map((group) => (
              <View key={group.date} className="mt-4">
                <Text className="mb-1 text-sm font-semibold text-text-secondary">
                  {group.label}
                </Text>
                <Card style={{ paddingVertical: 4 }}>
                  {group.items.map((tx) => (
                    <ReanimatedSwipeable
                      key={tx.id}
                      friction={2}
                      rightThreshold={40}
                      overshootRight={false}
                      renderRightActions={() => (
                        <Pressable
                          onPress={() => confirmDelete(tx)}
                          className="my-1 ml-2 items-center justify-center rounded-pill px-5"
                          style={{ backgroundColor: colors.danger }}>
                          <Trash size={20} color="#FFFFFF" />
                        </Pressable>
                      )}>
                      <TransactionItem
                        transaction={tx}
                        meta={timeLabel(tx.createdAt)}
                        onPress={() =>
                          txSheetRef.current?.open({ type: tx.type, transaction: tx })
                        }
                      />
                    </ReanimatedSwipeable>
                  ))}
                </Card>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TransactionSheet ref={txSheetRef} />
    </View>
  );
}
