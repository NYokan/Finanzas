import { View, type ViewProps } from 'react-native';

import { shadow } from '@/constants/colors';

/** Card blanca con radio 20 y la sombra estándar de la app. */
export function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View
      className="rounded-card bg-surface p-5"
      style={[shadow, style]}
      {...rest}>
      {children}
    </View>
  );
}
