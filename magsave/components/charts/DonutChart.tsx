import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { colors } from '@/constants/colors';

interface Props {
  data: { value: number; color: string }[];
  /** diámetro total */
  size?: number;
  /** color del círculo interior (debe igualar el fondo donde vive) */
  holeColor?: string;
  centerLabel?: string;
  centerSublabel?: string;
}

/** Gráfico de dona (gifted-charts) con label opcional al centro. */
export function DonutChart({
  data,
  size = 120,
  holeColor = colors.bg,
  centerLabel,
  centerSublabel,
}: Props) {
  const valid = data.filter((d) => d.value > 0);
  if (valid.length === 0) return null;

  return (
    <PieChart
      data={valid}
      donut
      radius={size / 2}
      innerRadius={size / 2 - 16}
      innerCircleColor={holeColor}
      centerLabelComponent={
        centerLabel
          ? () => (
              <View className="items-center">
                <Text className="font-sans text-base font-bold text-text-primary">
                  {centerLabel}
                </Text>
                {centerSublabel ? (
                  <Text className="font-sans text-[10px] text-text-secondary">
                    {centerSublabel}
                  </Text>
                ) : null}
              </View>
            )
          : undefined
      }
    />
  );
}
