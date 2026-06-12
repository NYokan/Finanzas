import * as Haptics from 'expo-haptics';
import { CaretLeft, CaretRight, Trash } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, SectionList, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionItem } from '@/components/TransactionItem';
import { DonutChart } from '@/components/charts/DonutChart';
import {
  TransactionSheet,
  type TransactionSheetRef,
} from '@/components/sheets/TransactionSheet';
import { BalanceHeader } from '@/components/ui/BalanceHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pill } from '@/components/ui/Pill';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/constants/colors';
import type { TransactionWithCategory } from '@/db/queries/transactions';
import { useCategoriesForType } from '@/hooks/useCategories';
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

interface DateSection {
  title: string;
  data: TransactionWithCategory[];
}

function groupByDate(items: TransactionWithCategory[]): DateSection[] {
  const sections: DateSection[] = [];
  let lastDate: string | null = null;
  for (const tx of items) {
    if (tx.date !== lastDate) {
      sections.push({ title: dateGroupLabel(tx.date), data: [tx] });
      lastDate = tx.date;
    } else {
      sections[sections.length - 1].data.push(tx);
    }
  }
  return sections;
}

export default function GastosScreen() {
  const insets = useSafeAreaInsets();
  const [monthYear, setMonthYear] = useState(currentMonthYear());
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const txSheetRef = useRef<TransactionSheetRef>(null);

  const { data: transactions, loading } = useTransactionsByMonth(monthYear, {
    type,
    categoryId,
  });
  const { data: byCategory } = useExpensesByCategory(monthYear);
  const { data: totals } = useMonthTotals(monthYear);
  const { data: categories } = useCategoriesForType(type);

  const sections = useMemo(() => groupByDate(transactions ?? []), [transactions]);
  const isExpense = type === 'expense';

  // Total mostrado: respeta el filtro de categoría activo
  const filteredTotal = useMemo(() => {
    if (categoryId !== undefined) {
      return (transactions ?? []).reduce((sum, t) => sum + t.amount, 0);
    }
    return isExpense ? (totals?.expense ?? 0) : (totals?.income ?? 0);
  }, [transactions, totals, categoryId, isExpense]);

  const selectedCategory = (categories ?? []).find((c) => c.id === categoryId);

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

  const header = (
    <View>
      {/* Selector de mes */}
      <View className="flex-row items-center justify-between px-5">
        <Pressable
          onPress={() => setMonthYear(shiftMonthYear(monthYear, -1))}
          hitSlop={10}
          className="rounded-full p-2.5"
          style={{ backgroundColor: colors.surface }}>
          <CaretLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text className="font-sans text-lg font-semibold capitalize text-text-primary">
          {monthYearLabel(monthYear)}
        </Text>
        <Pressable
          onPress={() => setMonthYear(shiftMonthYear(monthYear, 1))}
          hitSlop={10}
          className="rounded-full p-2.5"
          style={{ backgroundColor: colors.surface }}>
          <CaretRight size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Toggle gastos / ingresos */}
      <View className="mt-4 flex-row gap-2 px-5">
        <Pill
          label="Gastos"
          selected={isExpense}
          color={colors.danger}
          onPress={() => {
            setType('expense');
            setCategoryId(undefined);
          }}
        />
        <Pill
          label="Ingresos"
          selected={!isExpense}
          color={colors.success}
          onPress={() => {
            setType('income');
            setCategoryId(undefined);
          }}
        />
      </View>

      {/* Total + dona */}
      <View className="mt-5 px-5">
        <BalanceHeader
          label={
            selectedCategory
              ? `${selectedCategory.name} en ${monthYearLabel(monthYear)}`
              : isExpense
                ? `Gastado en ${monthYearLabel(monthYear)}`
                : `Ingresado en ${monthYearLabel(monthYear)}`
          }
          amount={filteredTotal}
          amountColor={isExpense ? colors.textPrimary : colors.success}
          right={
            isExpense && (byCategory ?? []).length > 0 ? (
              <DonutChart
                data={(byCategory ?? []).map((c) => ({
                  value: c.total,
                  color: c.color,
                }))}
                size={104}
                holeColor={colors.bg}
              />
            ) : undefined
          }
        />
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

      <View className="h-2" />
    </View>
  );

  return (
    <View className="flex-1 bg-bg">
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 130,
        }}
        renderSectionHeader={({ section }) => (
          <Text className="font-sans mb-1 mt-4 px-5 text-sm font-semibold text-text-secondary">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View className="px-5">
            <ReanimatedSwipeable
              friction={2}
              rightThreshold={40}
              overshootRight={false}
              renderRightActions={() => (
                <Pressable
                  onPress={() => confirmDelete(item)}
                  className="my-1 ml-2 items-center justify-center rounded-pill px-5"
                  style={{ backgroundColor: colors.danger }}>
                  <Trash size={20} color="#FFFFFF" />
                </Pressable>
              )}>
              <TransactionItem
                transaction={item}
                meta={timeLabel(item.createdAt)}
                onPress={() =>
                  txSheetRef.current?.open({ type: item.type, transaction: item })
                }
              />
            </ReanimatedSwipeable>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="mt-6 gap-3 px-5">
              <Skeleton height={48} radius={14} />
              <Skeleton height={48} radius={14} />
              <Skeleton height={48} radius={14} />
            </View>
          ) : (
            <EmptyState
              emoji={isExpense ? '🌱' : '💸'}
              title={isExpense ? 'Sin gastos por aquí' : 'Sin ingresos este mes'}
              subtitle={
                selectedCategory
                  ? `No hay movimientos de ${selectedCategory.name} este mes`
                  : 'Lo que registres este mes va a aparecer en esta lista'
              }
            />
          )
        }
      />

      <TransactionSheet ref={txSheetRef} />
    </View>
  );
}
