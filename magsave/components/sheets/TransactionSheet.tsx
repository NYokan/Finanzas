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
// Dentro de un bottom sheet de @gorhom los scrollables DEBEN venir de
// react-native-gesture-handler; los de react-native no responden al gesto.
import { ScrollView } from 'react-native-gesture-handler';

import { CategoryIcon } from '@/components/CategoryIcon';
import { NumericKeyboard } from '@/components/NumericKeyboard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { TransactionWithCategory } from '@/db/queries/transactions';
import { useCategoriesForType } from '@/hooks/useCategories';
import { saveTransaction } from '@/hooks/useTransactions';
import { parseISODate, relativeDateLabel, todayISO, toISODate } from '@/utils/dates';

import { AppSheet } from './AppSheet';

export interface TransactionSheetRef {
  open: (opts: {
    type: 'expense' | 'income';
    transaction?: TransactionWithCategory;
  }) => void;
}

// Sugerencias de nota según la categoría elegida
const SUGGESTIONS: Record<string, string[]> = {
  Comida: ['Supermercado', 'Almuerzo', 'Delivery', 'Café'],
  Transporte: ['Micro', 'Metro', 'Bencina', 'Uber'],
  Hogar: ['Arriendo', 'Luz', 'Agua', 'Internet'],
  Salud: ['Farmacia', 'Consulta', 'Examen'],
  Ocio: ['Cine', 'Salida', 'Suscripción', 'Juegos'],
  Ropa: ['Ropa', 'Zapatos', 'Accesorios'],
  Mascotas: ['Comida mascota', 'Veterinario'],
  Educación: ['Curso', 'Libros', 'Matrícula'],
  Trabajo: ['Sueldo', 'Freelance', 'Bono'],
  Otro: ['Regalo', 'Varios'],
};

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

    const isExpense = type === 'expense';
    const title = editingId
      ? isExpense ? 'Editar gasto' : 'Editar ingreso'
      : isExpense ? 'Nuevo gasto' : 'Nuevo ingreso';
    const accentColor = isExpense ? colors.danger : colors.success;
    const selectedCategory = (categories ?? []).find((c) => c.id === categoryId);
    const suggestions = selectedCategory ? SUGGESTIONS[selectedCategory.name] ?? [] : [];

    return (
      <AppSheet ref={sheetRef}>
        <View className="mt-1 flex-row items-center justify-center gap-2">
          <Text className="font-sans text-center text-xl font-semibold text-text-primary">
            {title}
          </Text>
          <View
            className="rounded-pill px-2.5 py-0.5"
            style={{ backgroundColor: isExpense ? colors.dangerDim : colors.successDim }}>
            <Text className="font-sans text-xs font-semibold" style={{ color: accentColor }}>
              {isExpense ? 'Gasto' : 'Ingreso'}
            </Text>
          </View>
        </View>

        {/* Monto grande al centro */}
        <View className="items-center py-2">
          <Text
            className="font-sans"
            style={{ fontSize: 48, fontWeight: '700', color: accentColor }}>
            {amount === '' ? '$0' : formatPartial(amount)}
          </Text>
        </View>

        {/* Selector de categoría (scroll horizontal) */}
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
                className="font-sans mt-1 text-xs"
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

        {/* Sugerencias de nombre según categoría */}
        {suggestions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  Haptics.selectionAsync();
                  setNote(s);
                }}
                className="rounded-pill px-3 py-1.5"
                style={{
                  backgroundColor: note === s ? colors.primaryDim : colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: note === s ? colors.primary : 'transparent',
                }}>
                <Text
                  className="font-sans text-xs font-medium"
                  style={{ color: note === s ? colors.primary : colors.textSecondary }}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

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
              fontFamily: 'Inter',
              color: colors.textPrimary,
            }}
          />
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center gap-1.5 rounded-pill px-3 py-2.5"
            style={{ backgroundColor: colors.primaryDim }}>
            <Calendar size={16} color={colors.primary} />
            <Text
              className="font-sans text-sm font-medium"
              style={{ color: colors.primary }}>
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
