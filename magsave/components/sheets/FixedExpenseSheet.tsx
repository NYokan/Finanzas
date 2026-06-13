import {
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'phosphor-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { CategoryIcon } from '@/components/CategoryIcon';
import { NumericKeyboard } from '@/components/NumericKeyboard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { FixedExpense } from '@/db/schema';
import { useCategoriesForType } from '@/hooks/useCategories';
import { saveFixedExpense } from '@/hooks/useFixedExpenses';

import { AppSheet } from './AppSheet';

export interface FixedExpenseSheetRef {
  open: (expense?: FixedExpense) => void;
}

/** Alta y edición de gastos fijos mensuales. */
export const FixedExpenseSheet = forwardRef<FixedExpenseSheetRef, object>(
  (_props, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dayOfMonth, setDayOfMonth] = useState(1);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [showDayPicker, setShowDayPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const { data: categories } = useCategoriesForType('expense');

    useImperativeHandle(ref, () => ({
      open: (expense) => {
        setEditingId(expense?.id ?? null);
        setName(expense?.name ?? '');
        setAmount(expense ? String(expense.amount) : '');
        setDayOfMonth(expense?.dayOfMonth ?? new Date().getDate());
        setCategoryId(expense?.categoryId ?? null);
        setShowDayPicker(false);
        sheetRef.current?.present();
      },
    }));

    // Se elige una fecha en el calendario y se usa solo el día del mes
    const onDayChange = (event: DateTimePickerEvent, selected?: Date) => {
      setShowDayPicker(false);
      if (event.type === 'set' && selected) {
        Haptics.selectionAsync();
        setDayOfMonth(selected.getDate());
      }
    };

    const pickerValue = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    };

    const save = async () => {
      const parsed = parseFloat(amount);
      if (!name.trim()) {
        Alert.alert('Falta el nombre', '¿Cómo se llama este gasto? (ej: Arriendo)');
        return;
      }
      if (!parsed || parsed <= 0) {
        Alert.alert('Falta el monto', 'Escribe cuánto se paga cada mes');
        return;
      }
      setSaving(true);
      try {
        await saveFixedExpense(
          {
            name: name.trim(),
            amount: parsed,
            dayOfMonth,
            categoryId,
            isActive: 1,
          },
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
        <Text className="font-sans mb-3 mt-1 text-center text-xl font-semibold text-text-primary">
          {editingId ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}
        </Text>

        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre (ej: Arriendo, Internet...)"
          placeholderTextColor={colors.textSecondary}
          style={{
            backgroundColor: colors.bg,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 15,
            fontFamily: 'Inter',
            color: colors.textPrimary,
          }}
        />

        <View className="flex-row items-center justify-between py-2">
          <Text
            className="font-sans"
            style={{ fontSize: 34, fontWeight: '700', color: colors.textPrimary }}>
            {amount === '' ? '$0' : `$${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`}
          </Text>
          {/* Día de vencimiento con calendario */}
          <Pressable
            onPress={() => setShowDayPicker(true)}
            className="flex-row items-center gap-1.5 rounded-pill px-3 py-2.5"
            style={{ backgroundColor: colors.primaryDim }}>
            <Calendar size={16} color={colors.primary} />
            <Text
              className="font-sans text-sm font-medium"
              style={{ color: colors.primary }}>
              Día {dayOfMonth} de cada mes
            </Text>
          </Pressable>
        </View>
        {showDayPicker && (
          <DateTimePicker value={pickerValue()} mode="date" onChange={onDayChange} />
        )}

        {/* Categoría */}
        <Text className="font-sans mb-1.5 text-sm font-medium text-text-secondary">
          Categoría
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}>
          {(categories ?? []).map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                Haptics.selectionAsync();
                setCategoryId(cat.id);
              }}
              className="items-center"
              style={{ width: 60, opacity: categoryId === cat.id ? 1 : 0.55 }}>
              <CategoryIcon icon={cat.icon} color={cat.color} size={40} />
              <Text
                numberOfLines={1}
                className="font-sans mt-1 text-xs"
                style={{ color: colors.textSecondary }}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mt-2">
          <NumericKeyboard value={amount} onChange={setAmount} />
        </View>

        <View className="mt-3">
          <Button
            label={editingId ? 'Guardar cambios' : 'Guardar'}
            onPress={save}
            loading={saving}
          />
        </View>
      </AppSheet>
    );
  },
);

FixedExpenseSheet.displayName = 'FixedExpenseSheet';
