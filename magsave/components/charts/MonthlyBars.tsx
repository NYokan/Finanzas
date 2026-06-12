import { Dimensions, Text, View } from 'react-native';
import { BarChart, type barDataItem } from 'react-native-gifted-charts';

import { colors } from '@/constants/colors';
import type { MonthlySeriesPoint } from '@/db/queries/transactions';
import { abbreviateMoney } from '@/utils/currency';
import { monthShortLabel } from '@/utils/dates';

interface Props {
  data: MonthlySeriesPoint[];
}

/** Barras agrupadas de ingresos (verde) vs gastos (coral) por mes — gifted-charts. */
export function MonthlyBars({ data }: Props) {
  const width = Dimensions.get('window').width - 88;
  const groups = data.length || 1;
  // dos barras por mes + espacio del grupo
  const barWidth = Math.max(5, Math.floor(width / groups / 2) - 9);

  const bars: barDataItem[] = data.flatMap((d) => [
    {
      value: d.income,
      frontColor: colors.success,
      spacing: 3,
      label: monthShortLabel(d.monthYear),
      labelWidth: barWidth * 2 + 6,
      labelTextStyle: {
        color: colors.textSecondary,
        fontSize: 10,
        fontFamily: 'Inter',
      },
    },
    {
      value: d.expense,
      frontColor: colors.danger,
      spacing: 16,
    },
  ]);

  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <View>
      <BarChart
        data={bars}
        width={width}
        height={190}
        barWidth={barWidth}
        barBorderTopLeftRadius={3}
        barBorderTopRightRadius={3}
        initialSpacing={8}
        endSpacing={0}
        noOfSections={4}
        maxValue={maxValue * 1.15}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={colors.border}
        rulesColor={colors.border}
        rulesType="solid"
        yAxisTextStyle={{
          color: colors.textSecondary,
          fontSize: 9,
          fontFamily: 'Inter',
        }}
        formatYLabel={(label: string) => abbreviateMoney(Number(label))}
        yAxisLabelWidth={42}
        isAnimated={false}
        disablePress
      />
      {/* Leyenda */}
      <View className="mt-2 flex-row justify-center gap-5">
        <View className="flex-row items-center gap-1.5">
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }}
          />
          <Text className="font-sans text-xs text-text-secondary">Ingresos</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }}
          />
          <Text className="font-sans text-xs text-text-secondary">Gastos</Text>
        </View>
      </View>
    </View>
  );
}
