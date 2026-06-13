import type { Icon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';

interface Props {
  emoji?: string;
  /** alternativa al emoji: ícono Phosphor en gris */
  icon?: Icon;
  title: string;
  subtitle?: string;
  /** Botón de acción opcional (ej. "Agregar gasto fijo") debajo del texto. */
  actionLabel?: string;
  onAction?: () => void;
}

/** Mensaje cálido cuando una lista todavía no tiene datos. */
export function EmptyState({
  emoji,
  icon: IconComponent,
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View className="items-center px-8 py-10">
      {IconComponent ? (
        <IconComponent size={48} color={colors.textSecondary} weight="duotone" />
      ) : (
        <Text className="font-sans text-5xl">{emoji}</Text>
      )}
      <Text className="font-sans mt-3 text-center text-base font-semibold text-text-primary">
        {title}
      </Text>
      {subtitle ? (
        <Text className="font-sans mt-1 text-center text-sm text-text-secondary">
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-5">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
