import { Text, View } from 'react-native';

interface Props {
  emoji: string;
  title: string;
  subtitle?: string;
}

/** Mensaje cálido cuando una lista todavía no tiene datos. */
export function EmptyState({ emoji, title, subtitle }: Props) {
  return (
    <View className="items-center px-8 py-10">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="mt-3 text-center text-base font-semibold text-text-primary">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1 text-center text-sm text-text-secondary">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
