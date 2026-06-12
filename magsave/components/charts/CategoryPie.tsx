import { Text, View } from 'react-native';
import { VictoryPie } from 'victory-native';

import { colors } from '@/constants/colors';
import type { CategoryTotal } from '@/db/queries/transactions';
import { formatMoney } from '@/utils/currency';

interface Props {
  data: CategoryTotal[];
}

/** Torta de gastos por categoría con leyenda debajo. */
export function CategoryPie({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  if (total <= 0) return null;

  return (
    <View className="items-center">
      <VictoryPie
        data={data.map((d) => ({ x: d.name, y: d.total }))}
        colorScale={data.map((d) => d.color)}
        width={240}
        height={210}
        innerRadius={58}
        padAngle={2}
        labels={() => ''}
      />
      <View className="w-full gap-2">
        {data.map((d) => (
          <View key={`${d.categoryId}`} className="flex-row items-center gap-2">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: d.color,
              }}
            />
            <Text className="flex-1 text-sm text-text-primary">{d.name}</Text>
            <Text className="text-sm font-semibold text-text-primary">
              {formatMoney(d.total)}
            </Text>
            <Text className="w-12 text-right text-xs" style={{ color: colors.textSecondary }}>
              {Math.round((d.total / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
