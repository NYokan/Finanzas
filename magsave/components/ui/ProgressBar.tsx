import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  /** 0–1 (se permite >1, se trunca el ancho) */
  progress: number;
  color?: string;
  height?: number;
  trackColor?: string;
  /** 'gradient' rellena con el gradiente rosa (metas de ahorro) */
  variant?: 'solid' | 'gradient';
}

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 10,
  trackColor = colors.track,
  variant = 'solid',
}: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  const fillStyle = {
    width: `${pct * 100}%`,
    height: '100%',
    borderRadius: height / 2,
  } as const;
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={fillStyle}
        />
      ) : (
        <View style={[fillStyle, { backgroundColor: color }]} />
      )}
    </View>
  );
}

/** Color según el porcentaje de presupuesto usado (spec Home). */
export function budgetColor(progress: number): string {
  if (progress < 0.6) return colors.success;
  if (progress <= 0.85) return colors.warning;
  return colors.danger;
}
