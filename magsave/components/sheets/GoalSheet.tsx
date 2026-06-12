import {
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Calendar, X } from 'phosphor-react-native';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

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

// Opciones básicas para partir rápido
const PRESETS: { name: string; emoji: string }[] = [
  { name: 'Viaje', emoji: '✈️' },
  { name: 'Emergencias', emoji: '🚨' },
  { name: 'Regalo', emoji: '🎁' },
  { name: 'Casa', emoji: '🏠' },
  { name: 'Auto', emoji: '🚗' },
  { name: 'Tecnología', emoji: '💻' },
];

// Palabras clave → emojis sugeridos según lo que escriba
const EMOJI_KEYWORDS: [RegExp, string[]][] = [
  [/viaje|vacacion|playa|paseo|turismo/, ['✈️', '🏖', '🧳']],
  [/espana|españa/, ['🇪🇸']],
  [/francia|paris/, ['🇫🇷', '🗼']],
  [/italia|roma/, ['🇮🇹']],
  [/japon|tokio/, ['🇯🇵']],
  [/brasil/, ['🇧🇷']],
  [/argentina/, ['🇦🇷']],
  [/peru/, ['🇵🇪']],
  [/mexico/, ['🇲🇽']],
  [/estados unidos|usa|gringo/, ['🇺🇸']],
  [/europa/, ['🇪🇺', '🏰']],
  [/casa|depa|departamento|hogar|mueble|pieza/, ['🏠', '🛋']],
  [/auto|carro|vehiculo/, ['🚗']],
  [/moto/, ['🏍']],
  [/bici|bicicleta/, ['🚲']],
  [/compu|laptop|notebook|pc|tecno/, ['💻']],
  [/celular|telefono|iphone/, ['📱']],
  [/emergencia|imprevisto|fondo|colchon/, ['🚨', '💰']],
  [/regalo|cumple|navidad/, ['🎁', '🎂']],
  [/perro|gato|mascota/, ['🐶', '🐱']],
  [/ropa|zapato|zapatilla/, ['👗', '👟']],
  [/estudio|curso|universidad|carrera|magister/, ['🎓', '📚']],
  [/matrimonio|boda|anillo/, ['💍']],
  [/bebe|hijo|guagua/, ['👶']],
  [/musica|guitarra|concierto|entrada/, ['🎸', '🎤']],
  [/foto|camara/, ['📷']],
  [/juego|consola|play|nintendo/, ['🎮']],
  [/plata|ahorro|dinero|inversion/, ['💰']],
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function suggestEmojis(name: string): string[] {
  const n = normalize(name);
  if (n.trim().length < 3) return [];
  const result: string[] = [];
  for (const [re, emojis] of EMOJI_KEYWORDS) {
    if (re.test(n)) {
      for (const e of emojis) if (!result.includes(e)) result.push(e);
    }
  }
  return result.slice(0, 6);
}

const EMOJIS = [
  '🏖', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍',
  '👶', '🐶', '🐱', '🎸', '📷', '🏍', '🚲', '👟',
  '🎮', '💄', '🌴', '🎂', '🛋', '🧳', '⚽', '📚',
  '🪴', '💰', '🛒', '🎤', '🎁', '❤️', '🌟', '🎯',
];

/** Crear o editar una meta de ahorro. */
export const GoalSheet = forwardRef<GoalSheetRef, object>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [emojiPickedManually, setEmojiPickedManually] = useState(false);
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const suggested = useMemo(() => suggestEmojis(name), [name]);

  useImperativeHandle(ref, () => ({
    open: (goal) => {
      setEditingId(goal?.id ?? null);
      setName(goal?.name ?? '');
      setEmoji(goal?.emoji ?? '🌟');
      setEmojiPickedManually(!!goal);
      setAmount(goal ? String(goal.targetAmount) : '');
      setDeadline(goal?.deadline ?? null);
      setShowDatePicker(false);
      sheetRef.current?.present();
    },
  }));

  const onNameChange = (text: string) => {
    setName(text);
    // si no eligió emoji a mano, adoptar la primera sugerencia
    if (!emojiPickedManually) {
      const s = suggestEmojis(text);
      if (s.length > 0) setEmoji(s[0]);
    }
  };

  const applyPreset = (preset: { name: string; emoji: string }) => {
    Haptics.selectionAsync();
    setName(preset.name);
    setEmoji(preset.emoji);
    setEmojiPickedManually(false);
  };

  const pickEmoji = (e: string) => {
    Haptics.selectionAsync();
    setEmoji(e);
    setEmojiPickedManually(true);
  };

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
      <Text className="font-sans mb-3 mt-1 text-center text-xl font-semibold text-text-primary">
        {editingId ? 'Editar meta' : 'Nueva meta de ahorro'}
      </Text>

      {/* Presets rápidos */}
      {!editingId && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => applyPreset(p)}
              className="flex-row items-center gap-1.5 rounded-pill px-3 py-2"
              style={{
                backgroundColor:
                  name === p.name ? colors.primaryDim : colors.surfaceAlt,
                borderWidth: 1,
                borderColor: name === p.name ? colors.primary : 'transparent',
              }}>
              <Text className="font-sans text-sm">{p.emoji}</Text>
              <Text
                className="font-sans text-sm font-medium"
                style={{
                  color: name === p.name ? colors.primaryLight : colors.textSecondary,
                }}>
                {p.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View className="flex-row items-center gap-3">
        <Text className="font-sans text-4xl">{emoji}</Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Nombre (ej: Viaje a España)"
          placeholderTextColor={colors.textSecondary}
          style={{
            flex: 1,
            backgroundColor: colors.bg,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 15,
            fontFamily: 'Inter',
            color: colors.textPrimary,
          }}
        />
      </View>

      {/* Emojis sugeridos según el nombre */}
      {suggested.length > 0 && (
        <View className="mt-2 flex-row items-center gap-2">
          <Text className="font-sans text-xs text-text-secondary">Sugeridos:</Text>
          {suggested.map((e) => (
            <Pressable
              key={e}
              onPress={() => pickEmoji(e)}
              className="rounded-pill px-2 py-1"
              style={{
                backgroundColor: emoji === e ? colors.primaryDim : 'transparent',
              }}>
              <Text className="font-sans text-2xl">{e}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Emoji picker (grid) */}
      <View className="mt-2 flex-row flex-wrap">
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            onPress={() => pickEmoji(e)}
            className="items-center justify-center rounded-pill"
            style={{
              width: '12.5%',
              paddingVertical: 5,
              backgroundColor: emoji === e ? colors.primaryDim : 'transparent',
            }}>
            <Text className="font-sans text-2xl">{e}</Text>
          </Pressable>
        ))}
      </View>

      {/* Monto objetivo */}
      <View className="items-center py-1">
        <Text
          className="font-sans"
          style={{ fontSize: 34, fontWeight: '700', color: colors.primaryLight }}>
          {amount === '' ? '$0' : `$${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`}
        </Text>
      </View>

      {/* Fecha límite (opcional) */}
      <View className="flex-row items-center justify-center gap-2">
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center gap-1.5 rounded-pill px-3 py-2"
          style={{ backgroundColor: colors.primaryDim }}>
          <Calendar size={15} color={colors.primaryLight} />
          <Text
            className="font-sans text-sm font-medium"
            style={{ color: colors.primaryLight }}>
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
