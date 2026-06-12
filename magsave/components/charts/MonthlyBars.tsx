import { Dimensions, Text, View } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup } from 'victory-native';

import { colors } from '@/constants/colors';
import type { MonthlySeriesPoint } from '@/db/queries/transactions';
import { abbreviateMoney } from '@/utils/currency';
import { monthShortLabel } from '@/utils/dates';

interface Props {
  data: MonthlySeriesPoint[];
}

/** Barras agrupadas de ingresos (verde) vs gastos (coral) por mes. */
export function MonthlyBars({ data }: Props) {
  const width = Dimensions.get('window').width - 56;
  const showLabels = data.length <= 6;

  const income = data.map((d) => ({ x: monthShortLabel(d.monthYear), y: d.income }));
  const expense = data.map((d) => ({ x: monthShortLabel(d.monthYear), y: d.expense }));

  return (
    <View>
      <VictoryChart
        width={width}
        height={240}
        domainPadding={{ x: data.length <= 3 ? 50 : 24, y: 20 }}
        padding={{ top: 24, bottom: 36, left: 16, right: 16 }}>
        <VictoryAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: {
              fill: colors.textSecondary,
              fontSize: 11,
              angle: data.length > 6 ? -35 : 0,
            },
          }}
        />
        <VictoryGroup
          offset={data.length > 6 ? 7 : 16}
          colorScale={[colors.success, colors.danger]}>
          <VictoryBar
            data={income}
            barWidth={data.length > 6 ? 6 : 14}
            cornerRadius={{ top: 3 }}
            labels={showLabels ? ({ datum }) => (datum.y > 0 ? abbreviateMoney(datum.y) : '') : undefined}
            style={{ labels: { fontSize: 9, fill: colors.success } }}
          />
          <VictoryBar
            data={expense}
            barWidth={data.length > 6 ? 6 : 14}
            cornerRadius={{ top: 3 }}
            labels={showLabels ? ({ datum }) => (datum.y > 0 ? abbreviateMoney(datum.y) : '') : undefined}
            style={{ labels: { fontSize: 9, fill: colors.danger } }}
          />
        </VictoryGroup>
      </VictoryChart>
      {/* Leyenda */}
      <View className="flex-row justify-center gap-5">
        <View className="flex-row items-center gap-1.5">
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }}
          />
          <Text className="text-xs text-text-secondary">Ingresos</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }}
          />
          <Text className="text-xs text-text-secondary">Gastos</Text>
        </View>
      </View>
    </View>
  );
}
