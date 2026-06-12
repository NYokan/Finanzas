import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : 'transparent';
  const fg = variant === 'ghost' ? colors.primary : '#FFFFFF';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className="items-center justify-center rounded-pill px-6 py-3.5 active:opacity-80"
      style={{ backgroundColor: bg, opacity: disabled ? 0.5 : 1 }}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text className="text-base font-semibold" style={{ color: fg }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
