import type { Icon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors, shadow } from '@/constants/colors';

interface Props {
  icon?: Icon;
  emoji?: string;
  title: string;
  amount: string;
  /** texto de la píldora inferior (ej. "61%") */
  badge?: string;
  /** color del ícono dentro del círculo gris (ej. el color de la categoría) */
  accentColor?: string;
  width?: number;
  onPress?: () => void;
}

/** Tarjeta métrica blanca minimal — carrusel de categorías del Home. */
export function GlassMetricCard({
  icon: IconComponent,
  emoji,
  title,
  amount,
  badge,
  accentColor = colors.primary,
  width = 150,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} className="active:opacity-80">
      <View
        style={[
          shadow,
          {
            width,
            borderRadius: 24,
            padding: 16,
            backgroundColor: colors.surface,
          },
        ]}>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 34,
            height: 34,
            backgroundColor: colors.surfaceAlt,
          }}>
          {IconComponent ? (
            <IconComponent size={18} color={accentColor} weight="duotone" />
          ) : (
            <Text className="font-sans text-base">{emoji}</Text>
          )}
        </View>
        <Text
          className="font-sans mt-3 text-sm text-text-secondary"
          numberOfLines={1}>
          {title}
        </Text>
        <Text
          className="font-sans mt-0.5 text-lg font-bold text-text-primary"
          numberOfLines={1}>
          {amount}
        </Text>
        {badge ? (
          <View
            className="mt-2 self-end rounded-pill px-2.5 py-1"
            style={{ backgroundColor: colors.primaryDim }}>
            <Text
              className="font-sans text-xs font-semibold"
              style={{ color: colors.primary }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
