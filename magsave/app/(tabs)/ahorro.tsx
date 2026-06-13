import { PiggyBank, Plus } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GoalDetailSheet,
  type GoalDetailSheetRef,
} from '@/components/sheets/GoalDetailSheet';
import { GoalSheet, type GoalSheetRef } from '@/components/sheets/GoalSheet';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, shadow } from '@/constants/colors';
import { tabBarClearance } from '@/constants/layout';
import type { GoalWithProgress } from '@/db/queries/savings';
import { useSavingsGoals, useTotalSaved } from '@/hooks/useSavingsGoals';
import { notifyGoalCompleted } from '@/utils/notifications';
import { formatMoney } from '@/utils/currency';

export default function AhorroScreen() {
  const insets = useSafeAreaInsets();
  const { data: goals, loading } = useSavingsGoals();
  const { data: totalSaved } = useTotalSaved();

  const goalSheetRef = useRef<GoalSheetRef>(null);
  const detailSheetRef = useRef<GoalDetailSheetRef>(null);
  const [celebrating, setCelebrating] = useState(false);

  const handleCompleted = (goal: GoalWithProgress) => {
    setCelebrating(true);
    notifyGoalCompleted(goal.name, goal.emoji);
  };

  const list = goals ?? [];

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: tabBarClearance(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xl font-bold text-text-primary">Ahorro</Text>

        {/* Total ahorrado */}
        <Card style={{ marginTop: 16, backgroundColor: colors.primaryDim }}>
          <Text className="font-sans text-sm text-text-secondary">Total ahorrado</Text>
          {totalSaved == null ? (
            <Skeleton width={160} height={36} style={{ marginTop: 6 }} />
          ) : (
            <Text className="font-sans mt-1 text-[34px] font-bold text-text-primary">
              {formatMoney(totalSaved)}
            </Text>
          )}
        </Card>

        {/* Grid de metas (2 columnas) */}
        {loading ? (
          <View className="mt-5 flex-row gap-3">
            <View className="flex-1">
              <Skeleton height={150} radius={20} />
            </View>
            <View className="flex-1">
              <Skeleton height={150} radius={20} />
            </View>
          </View>
        ) : list.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="Tu primera meta te espera"
            subtitle="¿Unas vacaciones? ¿Algo para la casa? Crea una meta y empieza a juntar"
          />
        ) : (
          <View className="mt-5 flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
            {list.map((goal) => {
              const progress =
                goal.targetAmount > 0 ? goal.saved / goal.targetAmount : 0;
              const completed = goal.isCompleted === 1;
              return (
                <View key={goal.id} className="w-1/2 p-1.5">
                  <Pressable
                    onPress={() => detailSheetRef.current?.open(goal)}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}>
                    <Card
                      style={{
                        backgroundColor: completed ? colors.successDim : colors.surface,
                      }}>
                      <Text
                        className="font-sans text-base font-semibold text-text-primary"
                        numberOfLines={1}>
                        {goal.name}
                      </Text>
                      {completed ? (
                        <Text
                          className="font-sans mt-2 text-sm font-bold"
                          style={{ color: colors.success }}>
                          ¡Lo lograste! 🎉
                        </Text>
                      ) : (
                        <>
                          <View className="mt-3">
                            <ProgressBar progress={progress} height={8} variant="gradient" />
                          </View>
                          <Text className="font-sans mt-2 text-xs text-text-secondary">
                            {formatMoney(goal.saved)} de {formatMoney(goal.targetAmount)}
                          </Text>
                          <Text
                            className="font-sans mt-0.5 text-sm font-bold"
                            style={{ color: colors.primary }}>
                            {Math.round(progress * 100)}%
                          </Text>
                        </>
                      )}
                    </Card>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Botón crear meta (por encima de la navbar flotante) */}
      <Pressable
        onPress={() => goalSheetRef.current?.open()}
        className="absolute flex-row items-center gap-2 rounded-full px-5 py-3.5"
        style={({ pressed }) => [
          shadow,
          {
            bottom: tabBarClearance(insets.bottom) - 24,
            right: 20,
            backgroundColor: colors.primary,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}>
        <Plus size={20} color="#FFFFFF" weight="bold" />
        <Text className="font-sans text-base font-semibold text-white">Nueva meta</Text>
      </Pressable>

      <GoalSheet ref={goalSheetRef} />
      <GoalDetailSheet
        ref={detailSheetRef}
        onCompleted={handleCompleted}
        onEdit={(goal) => goalSheetRef.current?.open(goal)}
      />

      {/* Confetti al completar una meta 🎉 */}
      {celebrating && (
        <ConfettiCannon
          count={180}
          origin={{ x: Dimensions.get('window').width / 2, y: -10 }}
          fadeOut
          autoStart
          onAnimationEnd={() => setCelebrating(false)}
        />
      )}
    </View>
  );
}
