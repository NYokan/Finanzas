import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Minus, Plus } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors, glowPink, HERO_GRADIENT } from '@/constants/colors';
import { formatMoney } from '@/utils/currency';

interface Props {
  /** ej. "Presupuesto de junio" */
  label: string;
  amount: number;
  /** si viene, se muestra el panel translúcido con la barra de progreso */
  budget?: { spent: number; total: number };
  onAddExpense: () => void;
  onAddIncome: () => void;
}

/**
 * Tarjeta principal del Home: gradiente rosa con borde glass y glow,
 * panel translúcido con el avance del presupuesto y los accesos
 * "+ Gasto" / "+ Ingreso" (reemplazan al FAB).
 */
export function HeroBalanceCard({
  label,
  amount,
  budget,
  onAddExpense,
  onAddIncome,
}: Props) {
  const progress = budget && budget.total > 0 ? budget.spent / budget.total : 0;
  const pct = Math.max(0, Math.min(1, progress));

  const press = (action: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <LinearGradient
      colors={[...HERO_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        glowPink,
        {
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          padding: 20,
        },
      ]}>
      <Text
        className="font-sans text-sm font-medium"
        style={{ color: 'rgba(255,255,255,0.85)' }}>
        {label}
      </Text>
      <Text
        className="font-sans mt-1 font-bold text-white"
        style={{ fontSize: 38 }}>
        {formatMoney(amount)}
      </Text>

      {budget && budget.total > 0 && (
        <View
          className="mt-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: 16,
            padding: 12,
          }}>
          <View className="flex-row justify-between">
            <Text
              className="font-sans text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.9)' }}>
              Gastado {formatMoney(budget.spent)}
            </Text>
            <Text
              className="font-sans text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.9)' }}>
              de {formatMoney(budget.total)}
            </Text>
          </View>
          <View
            className="mt-2"
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: `${pct * 100}%`,
                height: '100%',
                borderRadius: 3,
                backgroundColor: '#FFFFFF',
              }}
            />
          </View>
        </View>
      )}

      {/* Acciones rápidas */}
      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={press(onAddExpense)}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-pill bg-white py-3 active:opacity-80">
          <Minus size={15} color={colors.danger} weight="bold" />
          <Text
            className="font-sans text-sm font-semibold"
            style={{ color: colors.textPrimary }}>
            Gasto
          </Text>
        </Pressable>
        <Pressable
          onPress={press(onAddIncome)}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-pill bg-white py-3 active:opacity-80">
          <Plus size={15} color={colors.success} weight="bold" />
          <Text
            className="font-sans text-sm font-semibold"
            style={{ color: colors.textPrimary }}>
            Ingreso
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
