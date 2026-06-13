import * as Haptics from 'expo-haptics';
import { Backspace } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** dígitos máximos antes del punto */
  maxIntegerDigits?: number;
  /** chips de monto rápido sobre el teclado (ej. [1000, 5000, 10000]) */
  quickAmounts?: number[];
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;

/**
 * Teclado numérico propio (no el del sistema): números 0-9, punto decimal
 * y borrar. Estilo mockup: números grandes sin fondo por tecla, solo el
 * backspace como ícono; chips de monto rápido opcionales arriba.
 */
export function NumericKeyboard({
  value,
  onChange,
  maxIntegerDigits = 9,
  quickAmounts,
}: Props) {
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

  const pickQuick = (amount: number) => {
    Haptics.selectionAsync();
    onChange(String(amount));
  };

  return (
    <View>
      {quickAmounts && quickAmounts.length > 0 && (
        <View className="mb-1 flex-row justify-center gap-2">
          {quickAmounts.map((q) => (
            <Pressable
              key={q}
              onPress={() => pickQuick(q)}
              className="rounded-pill px-3.5 py-1.5 active:opacity-60"
              style={{
                backgroundColor:
                  value === String(q) ? colors.primaryDim : colors.inputBg,
                borderWidth: 1,
                borderColor: value === String(q) ? colors.primary : 'transparent',
              }}>
              <Text
                className="font-sans text-sm font-semibold"
                style={{
                  color: value === String(q) ? colors.primary : colors.textPrimary,
                }}>
                ${q.toLocaleString('es-CL')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <View className="flex-row flex-wrap">
        {KEYS.map((key) => (
          <View key={key} className="w-1/3 p-1">
            <Pressable
              onPress={() => press(key)}
              className="h-14 items-center justify-center rounded-pill active:opacity-40">
              {key === 'del' ? (
                <Backspace size={26} color={colors.textPrimary} />
              ) : (
                <Text
                  className="font-sans font-semibold text-text-primary"
                  style={{ fontSize: 26 }}>
                  {key}
                </Text>
              )}
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
