import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Minus, Plus } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors, glowPink, HERO_GRADIENT } from '@/constants/colors';
import { formatMoney } from '@/utils/currency';

interface Props {
  /** ej. "Disponible en junio" */
  label: string;
  /** disponible del mes (ingresos − gastos − fijos) */
  amount: number;
  /** presupuesto total del mes; muestra la línea explícita y la barra */
  budgetTotal?: number;
  income: number;
  /** gastado del mes (alimenta la columna Gastos y el panel) */
  expense: number;
  onAddExpense: () => void;
  onAddIncome: () => void;
}

const WHITE_SOFT = 'rgba(255,255,255,0.85)';
const GLASS_BG = 'rgba(255,255,255,0.25)';

/**
 * Tarjeta única del Home (layout v4 confirmado): disponible gigante,
 * línea de presupuesto, columnas Ingresos/Gastos, panel translúcido con
 * lo gastado y botones glass "Gasto"/"Ingreso" (no hay FAB).
 */
export function HeroBalanceCard({
  label,
  amount,
  budgetTotal,
  income,
  expense,
  onAddExpense,
  onAddIncome,
}: Props) {
  const hasBudget = budgetTotal != null && budgetTotal > 0;
  const progress = hasBudget ? expense / budgetTotal : 0;
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
        style={{ color: WHITE_SOFT }}>
        {label}
      </Text>
      <Text
        className="font-sans mt-1 font-bold text-white"
        style={{ fontSize: 40 }}>
        {formatMoney(amount)}
      </Text>
      {hasBudget && (
        <Text
          className="font-sans mt-1 text-sm font-medium"
          style={{ color: WHITE_SOFT }}>
          Presupuesto del mes: {formatMoney(budgetTotal)}
        </Text>
      )}

      {/* Ingresos / Gastos del mes */}
      <View className="mt-4 flex-row">
        <View className="flex-1">
          <Text className="font-sans text-xs font-medium" style={{ color: WHITE_SOFT }}>
            Ingresos
          </Text>
          <Text className="font-sans mt-0.5 text-lg font-bold text-white">
            {formatMoney(income)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-sans text-xs font-medium" style={{ color: WHITE_SOFT }}>
            Gastos
          </Text>
          <Text className="font-sans mt-0.5 text-lg font-bold text-white">
            {formatMoney(expense)}
          </Text>
        </View>
      </View>

      {/* Gastado del mes (con avance del presupuesto si existe) */}
      <View
        className="mt-4"
        style={{ backgroundColor: GLASS_BG, borderRadius: 16, padding: 12 }}>
        <View className="flex-row justify-between">
          <Text className="font-sans text-xs font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Gastado este mes {formatMoney(expense)}
          </Text>
          {hasBudget && (
            <Text className="font-sans text-xs font-bold text-white">
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>
        {hasBudget && (
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
        )}
      </View>

      {/* Acciones rápidas (glass) */}
      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={press(onAddExpense)}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-pill py-3 active:opacity-70"
          style={{
            backgroundColor: GLASS_BG,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          }}>
          <Minus size={15} color="#FFFFFF" weight="bold" />
          <Text className="font-sans text-sm font-semibold text-white">Gasto</Text>
        </Pressable>
        <Pressable
          onPress={press(onAddIncome)}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-pill py-3 active:opacity-70"
          style={{
            backgroundColor: GLASS_BG,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          }}>
          <Plus size={15} color="#FFFFFF" weight="bold" />
          <Text className="font-sans text-sm font-semibold text-white">Ingreso</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
