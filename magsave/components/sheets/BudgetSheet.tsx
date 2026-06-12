import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/CategoryIcon';
import { NumericKeyboard } from '@/components/NumericKeyboard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { Category } from '@/db/schema';
import { saveBudget } from '@/hooks/useBudgets';
import { currentMonthYear, monthYearLabel } from '@/utils/dates';

import { AppSheet } from './AppSheet';

export interface BudgetSheetRef {
  open: (category: Category, currentAmount: number) => void;
}

/** Editar el presupuesto mensual de una categoría. */
export const BudgetSheet = forwardRef<BudgetSheetRef, object>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (cat, currentAmount) => {
      setCategory(cat);
      setAmount(currentAmount > 0 ? String(currentAmount) : '');
      sheetRef.current?.present();
    },
  }));

  const save = async () => {
    if (!category) return;
    setSaving(true);
    try {
      await saveBudget(category.id, currentMonthYear(), parseFloat(amount) || 0);
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
      {category && (
        <>
          <View className="mt-1 items-center">
            <CategoryIcon icon={category.icon} color={category.color} size={52} />
            <Text className="font-sans mt-2 text-xl font-semibold text-text-primary">
              {category.name}
            </Text>
            <Text className="font-sans text-sm capitalize text-text-secondary">
              Presupuesto de {monthYearLabel(currentMonthYear())}
            </Text>
          </View>

          <View className="items-center py-3">
            <Text className="font-sans" style={{ fontSize: 44, fontWeight: '700', color: colors.primary }}>
              {amount === ''
                ? '$0'
                : `$${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`}
            </Text>
            <Text className="font-sans text-xs text-text-secondary">
              Deja $0 para quitar el presupuesto
            </Text>
          </View>

          <NumericKeyboard value={amount} onChange={setAmount} />

          <View className="mt-3">
            <Button label="Guardar" onPress={save} loading={saving} />
          </View>
        </>
      )}
    </AppSheet>
  );
});

BudgetSheet.displayName = 'BudgetSheet';
