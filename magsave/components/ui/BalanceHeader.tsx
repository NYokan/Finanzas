import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { formatMoney } from '@/utils/currency';

interface Props {
  /** texto pequeño sobre el monto (ej. "Presupuesto de junio") */
  label: string;
  amount: number;
  /** píldora junto al monto (ej. "+8%" o "Quedan $X") */
  badge?: { text: string; color?: string; bg?: string };
  /** elemento a la derecha (ej. gráfico de dona o botón de filtro) */
  right?: ReactNode;
  /** color del monto (por defecto blanco) */
  amountColor?: string;
}

/** Cabecera de balance: monto gigante + badge, estilo "Planned Expenses" del mockup. */
export function BalanceHeader({ label, amount, badge, right, amountColor }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="font-sans text-sm text-text-secondary">{label}</Text>
        <Text
          className="font-sans font-bold"
          style={{
            fontSize: 44,
            lineHeight: 52,
            color: amountColor ?? colors.textPrimary,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {formatMoney(amount)}
        </Text>
        {badge ? (
          <View
            className="mt-1 self-start rounded-pill px-3 py-1"
            style={{ backgroundColor: badge.bg ?? colors.surfaceAlt }}>
            <Text
              className="font-sans text-xs font-semibold"
              style={{ color: badge.color ?? colors.textSecondary }}>
              {badge.text}
            </Text>
          </View>
        ) : null}
      </View>
      {right}
    </View>
  );
}
