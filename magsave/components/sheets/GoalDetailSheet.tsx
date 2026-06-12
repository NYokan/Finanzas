import {
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Pencil, Trash } from 'phosphor-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { NumericKeyboard } from '@/components/NumericKeyboard';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants/colors';
import type { GoalWithProgress } from '@/db/queries/savings';
import {
  contribute,
  removeGoal,
  useGoalContributions,
} from '@/hooks/useSavingsGoals';
import { formatMoney } from '@/utils/currency';
import { relativeDateLabel } from '@/utils/dates';

import { AppSheet } from './AppSheet';

export interface GoalDetailSheetRef {
  open: (goal: GoalWithProgress) => void;
}

interface Props {
  /** Disparado cuando un aporte completa la meta (para confetti + notificación). */
  onCompleted: (goal: GoalWithProgress) => void;
  onEdit: (goal: GoalWithProgress) => void;
}

/** Detalle de una meta: progreso, historial de aportes y formulario de aporte. */
export const GoalDetailSheet = forwardRef<GoalDetailSheetRef, Props>(
  ({ onCompleted, onEdit }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [goal, setGoal] = useState<GoalWithProgress | null>(null);
    const [contributing, setContributing] = useState(false);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: contributions } = useGoalContributions(goal?.id ?? null);

    useImperativeHandle(ref, () => ({
      open: (g) => {
        setGoal(g);
        setContributing(false);
        setAmount('');
        setNote('');
        sheetRef.current?.present();
      },
    }));

    if (!goal) {
      return <AppSheet ref={sheetRef}>{null}</AppSheet>;
    }

    const progress = goal.targetAmount > 0 ? goal.saved / goal.targetAmount : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.saved);

    const saveContribution = async () => {
      const parsed = parseFloat(amount);
      if (!parsed || parsed <= 0) {
        Alert.alert('Falta el monto', '¿Cuánto vas a guardar hoy?');
        return;
      }
      setSaving(true);
      try {
        const { justCompleted } = await contribute(
          goal.id,
          parsed,
          note.trim() || undefined,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (justCompleted) {
          sheetRef.current?.dismiss();
          onCompleted(goal);
        } else {
          setGoal({ ...goal, saved: goal.saved + parsed });
          setContributing(false);
          setAmount('');
          setNote('');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Ups', 'No se pudo guardar el aporte. Inténtalo de nuevo.');
      } finally {
        setSaving(false);
      }
    };

    const confirmDelete = () => {
      Alert.alert(
        '¿Eliminar meta?',
        `Se borrará "${goal.name}" con todos sus aportes.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeGoal(goal.id);
                sheetRef.current?.dismiss();
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
      <AppSheet ref={sheetRef}>
        {/* Encabezado con acciones */}
        <View className="flex-row items-center justify-between">
          <Pressable onPress={confirmDelete} hitSlop={8} className="p-1">
            <Trash size={20} color={colors.textSecondary} />
          </Pressable>
          <Text className="font-sans text-5xl">{goal.emoji}</Text>
          <Pressable
            onPress={() => {
              sheetRef.current?.dismiss();
              setTimeout(() => onEdit(goal), 250);
            }}
            hitSlop={8}
            className="p-1">
            <Pencil size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Text className="font-sans mt-2 text-center text-xl font-semibold text-text-primary">
          {goal.name}
        </Text>

        {/* Progreso detallado */}
        <View className="mt-3">
          <ProgressBar progress={progress} height={12} />
          <View className="mt-2 flex-row justify-between">
            <Text className="font-sans text-sm text-text-secondary">
              {formatMoney(goal.saved)} de {formatMoney(goal.targetAmount)}
            </Text>
            <Text className="font-sans text-sm font-semibold" style={{ color: colors.primary }}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          {remaining > 0 && (
            <Text className="font-sans mt-1 text-sm text-text-secondary">
              Te faltan {formatMoney(remaining)} 💪
            </Text>
          )}
        </View>

        {contributing ? (
          <>
            {/* Formulario de aporte */}
            <View className="items-center py-2">
              <Text className="font-sans" style={{ fontSize: 40, fontWeight: '700', color: colors.success }}>
                {amount === ''
                  ? '$0'
                  : `$${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`}
              </Text>
            </View>
            <BottomSheetTextInput
              value={note}
              onChangeText={setNote}
              placeholder="Nota (opcional)"
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.bg,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 15,
                color: colors.textPrimary,
              }}
            />
            <View className="mt-2">
              <NumericKeyboard value={amount} onChange={setAmount} />
            </View>
            <View className="mt-3 gap-2">
              <Button label="Guardar aporte" onPress={saveContribution} loading={saving} />
              <Button label="Cancelar" variant="ghost" onPress={() => setContributing(false)} />
            </View>
          </>
        ) : (
          <>
            {/* Historial de aportes */}
            <Text className="font-sans mb-1 mt-4 text-sm font-semibold text-text-secondary">
              Historial de aportes
            </Text>
            {(contributions ?? []).length === 0 ? (
              <Text className="font-sans py-3 text-center text-sm text-text-secondary">
                Todavía no hay aportes. ¡El primero es el que cuenta! ✨
              </Text>
            ) : (
              <View style={{ maxHeight: 220 }}>
                {(contributions ?? []).slice(0, 8).map((c) => (
                  <View
                    key={c.id}
                    className="flex-row items-center justify-between border-b border-line py-2.5">
                    <View className="flex-1 pr-2">
                      <Text className="font-sans text-sm text-text-primary">
                        {relativeDateLabel(c.date)}
                      </Text>
                      {c.note ? (
                        <Text className="font-sans text-xs text-text-secondary" numberOfLines={1}>
                          {c.note}
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      className="font-sans text-base font-semibold"
                      style={{ color: colors.success }}>
                      +{formatMoney(c.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {!goal.isCompleted && (
              <View className="mt-4">
                <Button label="Agregar aporte" onPress={() => setContributing(true)} />
              </View>
            )}
          </>
        )}
      </AppSheet>
    );
  },
);

GoalDetailSheet.displayName = 'GoalDetailSheet';
