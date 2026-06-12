import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { TransactionWithCategory } from '@/db/queries/transactions';
import { formatMoney } from '@/utils/currency';

import { CategoryIcon } from './CategoryIcon';

interface Props {
  transaction: TransactionWithCategory;
  /** texto pequeño a la derecha del nombre (fecha relativa u hora) */
  meta?: string;
  onPress?: () => void;
}

export function TransactionItem({ transaction, meta, onPress }: Props) {
  const isExpense = transaction.type === 'expense';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 py-2.5 active:opacity-60">
      <CategoryIcon
        icon={transaction.category?.icon ?? 'Gift'}
        color={transaction.category?.color ?? '#888780'}
      />
      <View className="flex-1">
        <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
          {transaction.category?.name ?? 'Sin categoría'}
        </Text>
        {transaction.note ? (
          <Text className="text-sm text-text-secondary" numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text
          className="text-base font-semibold"
          style={{ color: isExpense ? colors.danger : colors.success }}>
          {isExpense ? '−' : '+'}
          {formatMoney(transaction.amount)}
        </Text>
        {meta ? (
          <Text className="text-xs text-text-secondary">{meta}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
