import { View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  /** 0–1 (se permite >1, se trunca el ancho) */
  progress: number;
  color?: string;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 10,
  trackColor = colors.border,
}: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** Color según el porcentaje de presupuesto usado (spec Home). */
export function budgetColor(progress: number): string {
  if (progress < 0.6) return colors.success;
  if (progress <= 0.85) return colors.warning;
  return colors.danger;
}
