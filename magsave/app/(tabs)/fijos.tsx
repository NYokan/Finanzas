import * as Haptics from 'expo-haptics';
import { CheckCircle, Plus } from 'phosphor-react-native';
import { useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/CategoryIcon';
import {
  FixedExpenseSheet,
  type FixedExpenseSheetRef,
} from '@/components/sheets/FixedExpenseSheet';
import { BalanceHeader } from '@/components/ui/BalanceHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, shadow } from '@/constants/colors';
import type { FixedExpenseWithStatus } from '@/db/queries/fixedExpenses';
import {
  removeFixedExpense,
  setPaid,
  useFixedExpenses,
} from '@/hooks/useFixedExpenses';
import { formatMoney } from '@/utils/currency';
import { currentMonthYear, monthYearLabel } from '@/utils/dates';

type Status = 'paid' | 'pending' | 'overdue';

function statusOf(item: FixedExpenseWithStatus, now: Date): Status {
  if (item.paidAt) return 'paid';
  return item.dayOfMonth < now.getDate() ? 'overdue' : 'pending';
}

const STATUS_LABEL: Record<Status, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Vencido',
};

const STATUS_COLOR: Record<Status, string> = {
  paid: colors.success,
  pending: colors.warning,
  overdue: colors.danger,
};

export default function FijosScreen() {
  const insets = useSafeAreaInsets();
  const monthYear = currentMonthYear();
  const sheetRef = useRef<FixedExpenseSheetRef>(null);
  const { data: items, loading } = useFixedExpenses(monthYear);

  const now = new Date();
  const list = items ?? [];
  const total = list.reduce((sum, i) => sum + i.amount, 0);
  const paidCount = list.filter((i) => i.paidAt).length;
  const maxAmount = Math.max(...list.map((i) => i.amount), 1);

  const togglePaid = (item: FixedExpenseWithStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!item.paidAt) {
      Alert.alert(
        '¿Marcar como pagado?',
        `${item.name} — ${formatMoney(item.amount)} de este mes.`,
        [
          { text: 'Todavía no', style: 'cancel' },
          {
            text: 'Sí, pagado ✓',
            onPress: async () => {
              try {
                await setPaid(item.id, monthYear, true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error) {
                console.error(error);
                Alert.alert('Ups', 'No se pudo actualizar. Inténtalo de nuevo.');
              }
            },
          },
        ],
      );
    } else {
      Alert.alert(
        '¿Marcar como pendiente?',
        `${item.name} volverá a aparecer como no pagado este mes.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sí, desmarcar',
            onPress: async () => {
              try {
                await setPaid(item.id, monthYear, false);
              } catch (error) {
                console.error(error);
                Alert.alert('Ups', 'No se pudo actualizar. Inténtalo de nuevo.');
              }
            },
          },
        ],
      );
    }
  };

  const showOptions = (item: FixedExpenseWithStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(item.name, formatMoney(item.amount), [
      { text: 'Editar', onPress: () => sheetRef.current?.open(item) },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            '¿Eliminar gasto fijo?',
            `Se borrará "${item.name}" y su historial de pagos.`,
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await removeFixedExpense(item.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } catch (error) {
                    console.error(error);
                    Alert.alert('Ups', 'No se pudo eliminar. Inténtalo de nuevo.');
                  }
                },
              },
            ],
          ),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xl font-bold text-text-primary">
          Gastos fijos
        </Text>
        <Text className="font-sans mt-0.5 text-sm capitalize text-text-secondary">
          {monthYearLabel(monthYear)}
        </Text>

        {/* Resumen */}
        <View className="mt-5">
          {loading ? (
            <Skeleton height={80} radius={20} />
          ) : (
            <>
              <BalanceHeader
                label="Total fijos del mes"
                amount={total}
                badge={
                  list.length > 0
                    ? {
                        text: `${paidCount} de ${list.length} pagados`,
                        color: paidCount === list.length ? colors.success : colors.textSecondary,
                        bg: paidCount === list.length ? colors.successDim : colors.surfaceAlt,
                      }
                    : undefined
                }
              />
              {list.length > 0 && (
                <View className="mt-3">
                  <ProgressBar
                    progress={list.length ? paidCount / list.length : 0}
                    color={colors.accent}
                    trackColor={colors.surfaceAlt}
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* Grid: los de mayor monto ocupan más espacio */}
        <View className="mt-5">
          {loading ? (
            <View className="gap-3">
              <Skeleton height={90} radius={20} />
              <Skeleton height={90} radius={20} />
            </View>
          ) : list.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="Sin gastos fijos aún"
              subtitle="Agrega arriendo, internet, suscripciones... y nunca más se te pasa una fecha"
            />
          ) : (
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
              {list.map((item) => {
                const status = statusOf(item, now);
                const isPaid = status === 'paid';
                const isBig = item.amount >= maxAmount * 0.6;
                return (
                  <View
                    key={item.id}
                    className="p-1.5"
                    style={{ width: isBig ? '100%' : '50%' }}>
                    <Pressable
                      onPress={() => togglePaid(item)}
                      onLongPress={() => showOptions(item)}
                      className="active:opacity-70">
                      <Card
                        style={{
                          opacity: isPaid ? 0.45 : 1,
                          minHeight: isBig ? 128 : 104,
                        }}>
                        <View className="flex-row items-start justify-between">
                          <CategoryIcon
                            icon={item.category?.icon ?? 'Gift'}
                            color={item.category?.color ?? colors.textSecondary}
                            size={isBig ? 42 : 36}
                            bgColor={colors.surfaceAlt}
                          />
                          {isPaid && (
                            <CheckCircle size={22} color={colors.success} weight="fill" />
                          )}
                        </View>
                        <Text
                          className="font-sans mt-2 font-semibold text-text-primary"
                          style={{
                            fontSize: isBig ? 17 : 15,
                            textDecorationLine: isPaid ? 'line-through' : 'none',
                          }}
                          numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View className="mt-1 flex-row items-center justify-between">
                          <Text
                            className="font-sans font-bold text-text-primary"
                            style={{ fontSize: isBig ? 20 : 16 }}>
                            {formatMoney(item.amount)}
                          </Text>
                          {isBig && (
                            <Text className="font-sans text-xs text-text-secondary">
                              Día {item.dayOfMonth} de cada mes
                            </Text>
                          )}
                        </View>
                        <View className="mt-1.5 flex-row items-center justify-between">
                          {!isBig && (
                            <Text className="font-sans text-xs text-text-secondary">
                              Día {item.dayOfMonth}
                            </Text>
                          )}
                          <Text
                            className="font-sans text-xs font-semibold"
                            style={{ color: STATUS_COLOR[status] }}>
                            {STATUS_LABEL[status]}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {list.length > 0 && (
          <Text className="font-sans mt-2 text-center text-xs text-text-secondary">
            Toca para marcar pagado · mantén presionado para editar o eliminar
          </Text>
        )}
      </ScrollView>

      {/* Botón agregar */}
      <Pressable
        onPress={() => sheetRef.current?.open()}
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

      <FixedExpenseSheet ref={sheetRef} />
    </View>
  );
}
