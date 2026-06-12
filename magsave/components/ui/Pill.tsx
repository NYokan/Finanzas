import { Pressable, Text } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

/** Chip/badge redondeado, usado en filtros de categoría y selectores. */
export function Pill({ label, selected = false, onPress, color = colors.primary }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-pill border px-4 py-2"
      style={{
        backgroundColor: selected ? color : colors.surface,
        borderColor: selected ? color : colors.border,
      }}>
      <Text
        className="text-sm font-medium"
        style={{ color: selected ? '#FFFFFF' : colors.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}
