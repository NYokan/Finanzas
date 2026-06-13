import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

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
  /** versión banner: cuerpo truncado a 2 líneas; tocar para expandir */
  compact?: boolean;
}

export function AdviceCard({ advice, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const tone = TONE_COLORS[advice.tone];
  const IconComponent = advice.icon;
  const showFull = !compact || expanded;

  const handlePress = () => {
    if (!compact) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={handlePress} disabled={!compact} className="active:opacity-90">
      <Card
        style={[
          compact ? { paddingVertical: 14 } : undefined,
          expanded ? { borderWidth: 1.5, borderColor: tone.fg + '50' } : undefined,
        ]}>
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
              numberOfLines={showFull ? undefined : 2}>
              {advice.body}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
