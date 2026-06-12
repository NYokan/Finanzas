import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** dígitos máximos antes del punto */
  maxIntegerDigits?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;

/**
 * Teclado numérico propio (no el del sistema): números 0-9, punto decimal
 * y borrar. Teclas grandes y fáciles de tocar, con haptic feedback.
 */
export function NumericKeyboard({ value, onChange, maxIntegerDigits = 9 }: Props) {
  const press = (key: (typeof KEYS)[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (value.includes('.')) return;
      onChange(value === '' ? '0.' : `${value}.`);
      return;
    }
    // dígito
    const [intPart = '', decPart] = value.split('.');
    if (decPart !== undefined) {
      if (decPart.length >= 2) return; // máx 2 decimales
    } else if (intPart.length >= maxIntegerDigits) {
      return;
    }
    if (value === '0') {
      onChange(key);
      return;
    }
    onChange(value + key);
  };

  return (
    <View className="flex-row flex-wrap">
      {KEYS.map((key) => (
        <View key={key} className="w-1/3 p-1.5">
          <Pressable
            onPress={() => press(key)}
            className="h-16 items-center justify-center rounded-pill active:opacity-60"
            style={{
              backgroundColor: key === 'del' ? colors.primaryDim : colors.bg,
            }}>
            {key === 'del' ? (
              <Delete size={26} color={colors.primary} />
            ) : (
              <Text className="text-2xl font-semibold text-text-primary">
                {key}
              </Text>
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}
