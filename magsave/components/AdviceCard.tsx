import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import type { Advice, AdviceTone } from '@/utils/advisor';

const TONE_COLORS: Record<AdviceTone, { fg: string; bg: string }> = {
  info: { fg: colors.primary, bg: colors.primaryDim },
  warn: { fg: colors.warning, bg: colors.warningDim },
  win: { fg: colors.success, bg: colors.successDim },
};

interface Props {
  advice: Advice;
  /** versión banner: cuerpo en una sola línea (Home) */
  compact?: boolean;
}

/** Card blanca de un consejo del motor local, con ícono según tone. */
export function AdviceCard({ advice, compact = false }: Props) {
  const tone = TONE_COLORS[advice.tone];
  const IconComponent = advice.icon;
  return (
    <Card style={compact ? { paddingVertical: 14 } : undefined}>
      <View className="flex-row items-center gap-3">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 38, height: 38, backgroundColor: tone.bg }}>
          <IconComponent size={20} color={tone.fg} weight="duotone" />
        </View>
        <View className="flex-1">
          <Text
            className="font-sans text-sm font-semibold text-text-primary"
            numberOfLines={1}>
            {advice.title}
          </Text>
          <Text
            className="font-sans mt-0.5 text-sm text-text-secondary"
            numberOfLines={compact ? 2 : undefined}>
            {advice.body}
          </Text>
        </View>
      </View>
    </Card>
  );
}
