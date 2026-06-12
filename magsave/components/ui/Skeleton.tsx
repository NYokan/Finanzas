import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

/** Bloque gris con pulso suave mientras carga la data de SQLite. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}
