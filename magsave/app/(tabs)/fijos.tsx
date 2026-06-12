import * as Haptics from 'expo-haptics';
import { Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/CategoryIcon';
import {
  FixedExpenseSheet,
  type FixedExpenseSheetRef,
} from '@/components/sheets/FixedExpenseSheet';
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
  paid: 'Pagado ✓',
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

  const togglePaid = async (item: FixedExpenseWithStatus) => {
    try {
      if (!item.paidAt) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setPaid(item.id, monthYear, true);
      } else {
        Alert.alert(
          '¿Marcar como pendiente?',
          `${item.name} volverá a aparecer como no pagado este mes.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sí, desmarcar',
              onPress: () => setPaid(item.id, monthYear, false),
            },
          ],
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ups', 'No se pudo actualizar. Inténtalo de nuevo.');
    }
  };

  const confirmDelete = (item: FixedExpenseWithStatus) => {
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
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-[28px] font-bold text-text-primary">Gastos fijos</Text>
        <Text className="mt-1 text-base capitalize text-text-secondary">
          {monthYearLabel(monthYear)}
        </Text>

        {/* Resumen */}
        <Card style={{ marginTop: 16 }}>
          {loading ? (
            <Skeleton width={200} height={32} />
          ) : (
            <>
              <Text className="text-sm text-text-secondary">
                Total fijos del mes
              </Text>
              <Text className="mt-1 text-3xl font-bold text-text-primary">
                {formatMoney(total)}
              </Text>
              {list.length > 0 && (
                <>
                  <View className="mt-3">
                    <ProgressBar
                      progress={list.length ? paidCount / list.length : 0}
                      color={colors.success}
                    />
                  </View>
                  <Text className="mt-2 text-sm text-text-secondary">
                    {paidCount} de {list.length} pagados
                  </Text>
                </>
              )}
            </>
          )}
        </Card>

        {/* Lista */}
        <View className="mt-5">
          {loading ? (
            <View className="gap-3">
              <Skeleton height={64} radius={16} />
              <Skeleton height={64} radius={16} />
            </View>
          ) : list.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="Sin gastos fijos aún"
              subtitle="Agrega arriendo, internet, suscripciones... y nunca más se te pasa una fecha"
            />
          ) : (
            <Card style={{ paddingVertical: 4 }}>
              {list.map((item) => {
                const status = statusOf(item, now);
                return (
                  <ReanimatedSwipeable
                    key={item.id}
                    friction={2}
                    rightThreshold={40}
                    overshootRight={false}
                    renderRightActions={() => (
                      <View className="flex-row">
                        <Pressable
                          onPress={() => sheetRef.current?.open(item)}
                          className="my-1 ml-2 items-center justify-center rounded-pill px-4"
                          style={{ backgroundColor: colors.primary }}>
                          <Pencil size={18} color="#FFFFFF" />
                        </Pressable>
                        <Pressable
                          onPress={() => confirmDelete(item)}
                          className="my-1 ml-2 items-center justify-center rounded-pill px-4"
                          style={{ backgroundColor: colors.danger }}>
                          <Trash2 size={18} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    )}>
                    <Pressable
                      onPress={() => togglePaid(item)}
                      className="flex-row items-center gap-3 py-3 active:opacity-60">
                      <CategoryIcon
                        icon={item.category?.icon ?? 'Gift'}
                        color={item.category?.color ?? '#888780'}
                      />
                      <View className="flex-1">
                        <Text
                          className="text-base font-medium text-text-primary"
                          numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                          Día {item.dayOfMonth} de cada mes
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-base font-semibold text-text-primary">
                          {formatMoney(item.amount)}
                        </Text>
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: STATUS_COLOR[status] }}>
                          {STATUS_LABEL[status]}
                        </Text>
                      </View>
                    </Pressable>
                  </ReanimatedSwipeable>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Botón agregar */}
      <Pressable
        onPress={() => sheetRef.current?.open()}
        className="absolute flex-row items-center gap-2 rounded-full px-5 py-3.5 active:opacity-80"
        style={[
          shadow,
          { bottom: 24, alignSelf: 'center', backgroundColor: colors.primary },
        ]}>
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text className="text-base font-semibold text-white">Agregar fijo</Text>
      </Pressable>

      <FixedExpenseSheet ref={sheetRef} />
    </View>
  );
}
