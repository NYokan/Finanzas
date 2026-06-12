import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { TransactionWithCategory } from '@/db/queries/transactions';
import { formatMoney } from '@/utils/currency';

import { CategoryIcon } from './CategoryIcon';

interface Props {
  transaction: TransactionWithCategory;
  /** texto pequeño bajo el título (fecha relativa u hora) */
  meta?: string;
  onPress?: () => void;
}

/**
 * Fila de transacción estilo mockup: círculo gris oscuro con el ícono,
 * título + fecha al centro, monto a la derecha.
 */
export function TransactionItem({ transaction, meta, onPress }: Props) {
  const isExpense = transaction.type === 'expense';
  const categoryName = transaction.category?.name ?? 'Sin categoría';
  const title = transaction.note || categoryName;
  const subtitle = [meta, transaction.note ? categoryName : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between py-2 active:opacity-60"
      style={{ marginBottom: 4 }}>
      <View className="flex-1 flex-row items-center gap-3 pr-3">
        <CategoryIcon
          icon={transaction.category?.icon ?? 'Gift'}
          color={transaction.category?.color ?? colors.textSecondary}
          size={48}
          bgColor={colors.surfaceAlt}
        />
        <View className="flex-1">
          <Text
            className="font-sans text-base font-medium text-text-primary"
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="font-sans mt-0.5 text-sm text-text-secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Text
        className="font-sans text-base font-semibold"
        style={{ color: isExpense ? colors.textPrimary : colors.success }}>
        {isExpense ? '−' : '+'}
        {formatMoney(transaction.amount)}
      </Text>
    </Pressable>
  );
}
