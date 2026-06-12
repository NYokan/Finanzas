import {
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Calendar, X } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { NumericKeyboard } from '@/components/NumericKeyboard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { SavingsGoal } from '@/db/schema';
import { saveGoal } from '@/hooks/useSavingsGoals';
import { fullDateLabel, parseISODate, toISODate } from '@/utils/dates';

import { AppSheet } from './AppSheet';

export interface GoalSheetRef {
  open: (goal?: SavingsGoal) => void;
}

const EMOJIS = [
  '🏖', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍',
  '👶', '🐶', '🐱', '🎸', '📷', '🛵', '🚲', '👟',
  '🎮', '💄', '🌴', '🎂', '🛋', '🧳', '⚽', '📚',
  '🪴', '💰', '🛒', '🎤', '🎁', '❤️', '🌟', '🎯',
];

/** Crear o editar una meta de ahorro. */
export const GoalSheet = forwardRef<GoalSheetRef, object>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (goal) => {
      setEditingId(goal?.id ?? null);
      setName(goal?.name ?? '');
      setEmoji(goal?.emoji ?? '🌟');
      setAmount(goal ? String(goal.targetAmount) : '');
      setDeadline(goal?.deadline ?? null);
      setShowDatePicker(false);
      sheetRef.current?.present();
    },
  }));

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) setDeadline(toISODate(selected));
  };

  const save = async () => {
    const parsed = parseFloat(amount);
    if (!name.trim()) {
      Alert.alert('Falta el nombre', '¿Para qué estás ahorrando? (ej: Vacaciones)');
      return;
    }
    if (!parsed || parsed <= 0) {
      Alert.alert('Falta el monto', '¿Cuánto necesitas juntar?');
      return;
    }
    setSaving(true);
    try {
      await saveGoal(
        { name: name.trim(), emoji, targetAmount: parsed, deadline },
        editingId ?? undefined,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      sheetRef.current?.dismiss();
    } catch (error) {
      console.error(error);
      Alert.alert('Ups', 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppSheet ref={sheetRef}>
      <Text className="mb-3 mt-1 text-center text-xl font-semibold text-text-primary">
        {editingId ? 'Editar meta' : 'Nueva meta de ahorro'}
      </Text>

      <BottomSheetTextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre (ej: Vacaciones en la playa)"
        placeholderTextColor={colors.textSecondary}
        style={{
          backgroundColor: colors.bg,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          fontSize: 15,
          color: colors.textPrimary,
        }}
      />

      {/* Emoji picker (grid) */}
      <View className="mt-3 flex-row flex-wrap">
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            onPress={() => {
              Haptics.selectionAsync();
              setEmoji(e);
            }}
            className="items-center justify-center rounded-pill"
            style={{
              width: '12.5%',
              paddingVertical: 6,
              backgroundColor: emoji === e ? colors.primaryDim : 'transparent',
            }}>
            <Text className="text-2xl">{e}</Text>
          </Pressable>
        ))}
      </View>

      {/* Monto objetivo */}
      <View className="items-center py-1">
        <Text style={{ fontSize: 36, fontWeight: '700', color: colors.primary }}>
          {amount === '' ? '$0' : `$${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`}
        </Text>
      </View>

      {/* Fecha límite (opcional) */}
      <View className="flex-row items-center justify-center gap-2">
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center gap-1.5 rounded-pill px-3 py-2"
          style={{ backgroundColor: colors.primaryDim }}>
          <Calendar size={15} color={colors.primary} />
          <Text className="text-sm font-medium" style={{ color: colors.primary }}>
            {deadline
              ? `Para el ${fullDateLabel(parseISODate(deadline)).toLowerCase()}`
              : 'Fecha límite (opcional)'}
          </Text>
        </Pressable>
        {deadline && (
          <Pressable onPress={() => setDeadline(null)} hitSlop={8}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={deadline ? parseISODate(deadline) : new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      <View className="mt-2">
        <NumericKeyboard value={amount} onChange={setAmount} />
      </View>

      <View className="mt-3">
        <Button
          label={editingId ? 'Guardar cambios' : 'Crear meta'}
          onPress={save}
          loading={saving}
        />
      </View>
    </AppSheet>
  );
});

GoalSheet.displayName = 'GoalSheet';
