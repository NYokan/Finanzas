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
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/CategoryIcon';
import { NumericKeyboard } from '@/components/NumericKeyboard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { TransactionWithCategory } from '@/db/queries/transactions';
import { useCategoriesForType } from '@/hooks/useCategories';
import { saveTransaction } from '@/hooks/useTransactions';
import { formatMoney } from '@/utils/currency';
import { parseISODate, relativeDateLabel, todayISO, toISODate } from '@/utils/dates';

import { AppSheet } from './AppSheet';

export interface TransactionSheetRef {
  open: (opts: {
    type: 'expense' | 'income';
    transaction?: TransactionWithCategory;
  }) => void;
}

/** Formulario para agregar o editar un gasto/ingreso, en bottom sheet. */
export const TransactionSheet = forwardRef<TransactionSheetRef, object>(
  (_props, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(todayISO());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const { data: categories } = useCategoriesForType(type);

    useImperativeHandle(ref, () => ({
      open: ({ type: newType, transaction }) => {
        setType(newType);
        setEditingId(transaction?.id ?? null);
        setAmount(transaction ? String(transaction.amount) : '');
        setCategoryId(transaction?.categoryId ?? null);
        setNote(transaction?.note ?? '');
        setDate(transaction?.date ?? todayISO());
        setShowDatePicker(false);
        sheetRef.current?.present();
      },
    }));

    const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
      setShowDatePicker(false);
      if (event.type === 'set' && selected) setDate(toISODate(selected));
    };

    const save = async () => {
      const parsed = parseFloat(amount);
      if (!parsed || parsed <= 0) {
        Alert.alert('Falta el monto', 'Escribe cuánto fue 💸');
        return;
      }
      if (categoryId == null) {
        Alert.alert('Falta la categoría', 'Elige una categoría para ordenar tus cuentas');
        return;
      }
      setSaving(true);
      try {
        await saveTransaction(
          { amount: parsed, type, categoryId, note: note.trim() || null, date },
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

    const title = editingId
      ? type === 'expense' ? 'Editar gasto' : 'Editar ingreso'
      : type === 'expense' ? 'Nuevo gasto' : 'Nuevo ingreso';
    const amountColor = type === 'expense' ? colors.danger : colors.success;
    const parsedAmount = parseFloat(amount);

    return (
      <AppSheet ref={sheetRef}>
        <Text className="mb-2 mt-1 text-center text-xl font-semibold text-text-primary">
          {title}
        </Text>

        {/* Monto grande al centro */}
        <View className="items-center py-2">
          <Text style={{ fontSize: 48, fontWeight: '700', color: amountColor }}>
            {amount === '' ? '$0' : formatPartial(amount)}
          </Text>
          {parsedAmount > 0 && amount.includes('.') ? (
            <Text className="text-xs text-text-secondary">
              {formatMoney(parsedAmount)}
            </Text>
          ) : null}
        </View>

        {/* Selector de categoría (grid de íconos) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingVertical: 6 }}>
          {(categories ?? []).map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                Haptics.selectionAsync();
                setCategoryId(cat.id);
              }}
              className="items-center"
              style={{ width: 64, opacity: categoryId === cat.id ? 1 : 0.55 }}>
              <View
                className="rounded-full"
                style={{
                  borderWidth: 2,
                  borderColor: categoryId === cat.id ? cat.color : 'transparent',
                  padding: 2,
                }}>
                <CategoryIcon icon={cat.icon} color={cat.color} size={44} />
              </View>
              <Text
                numberOfLines={1}
                className="mt-1 text-xs"
                style={{
                  color:
                    categoryId === cat.id
                      ? colors.textPrimary
                      : colors.textSecondary,
                  fontWeight: categoryId === cat.id ? '600' : '400',
                }}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Nota + fecha */}
        <View className="mt-2 flex-row items-center gap-3">
          <BottomSheetTextInput
            value={note}
            onChangeText={setNote}
            placeholder="Nota (opcional)"
            placeholderTextColor={colors.textSecondary}
            style={{
              flex: 1,
              backgroundColor: colors.bg,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.textPrimary,
            }}
          />
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center gap-1.5 rounded-pill px-3 py-2.5"
            style={{ backgroundColor: colors.primaryDim }}>
            <Calendar size={16} color={colors.primary} />
            <Text className="text-sm font-medium" style={{ color: colors.primary }}>
              {relativeDateLabel(date)}
            </Text>
          </Pressable>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={parseISODate(date)}
            mode="date"
            onChange={onDateChange}
          />
        )}

        {/* Teclado numérico custom */}
        <View className="mt-3">
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

TransactionSheet.displayName = 'TransactionSheet';

/** Muestra el monto que se está escribiendo, con separador de miles. */
function formatPartial(raw: string): string {
  const [intPart, decPart] = raw.split('.');
  const intFormatted = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decPart !== undefined) return `$${intFormatted},${decPart}`;
  return `$${intFormatted}`;
}
