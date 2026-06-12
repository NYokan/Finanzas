import { LinearGradient } from 'expo-linear-gradient';
import type { Icon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

// Gradientes de las metric cards (guía: morado medio → oscuro en diagonal)
export const CARD_GRADIENTS: [string, string][] = [
  ['#9D71FD', '#5B36B8'], // morado neón
  ['#47B0FF', '#1D6BB5'], // azul claro
  ['#22C55E', '#0F7A3D'], // verde
  ['#F2C14E', '#B07F1A'], // ámbar
  ['#F07A50', '#AB4423'], // coral
];

interface Props {
  icon?: Icon;
  emoji?: string;
  title: string;
  amount: string;
  /** texto de la píldora inferior (ej. "61%") */
  badge?: string;
  gradient: [string, string];
  width?: number;
  onPress?: () => void;
}

/** Tarjeta translúcida con gradiente — estilo "Housing / Food / Saving" del mockup. */
export function GlassMetricCard({
  icon: IconComponent,
  emoji,
  title,
  amount,
  badge,
  gradient,
  width = 140,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} className="active:opacity-80">
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width,
          borderRadius: 24,
          padding: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.glassBorder,
        }}>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 34,
            height: 34,
            backgroundColor: 'rgba(255,255,255,0.18)',
          }}>
          {IconComponent ? (
            <IconComponent size={18} color="#FFFFFF" weight="fill" />
          ) : (
            <Text className="font-sans text-base">{emoji}</Text>
          )}
        </View>
        <Text
          className="font-sans mt-3 text-sm"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-sans mt-0.5 text-lg font-bold text-white" numberOfLines={1}>
          {amount}
        </Text>
        {badge ? (
          <View
            className="mt-2 self-end rounded-pill px-2.5 py-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
            <Text className="font-sans text-xs font-semibold text-white">{badge}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}
