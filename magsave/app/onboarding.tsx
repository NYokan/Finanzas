import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Heart, Lock, PiggyBank, Receipt, Repeat } from 'phosphor-react-native';
import { useRef, useState, type ReactNode } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { ONBOARDING_KEY } from '@/constants/storage';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  subtitle: string;
  illustration: ReactNode;
}

function IconBubble({ children, bg }: { children: ReactNode; bg: string }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ width: 84, height: 84, backgroundColor: bg }}>
      {children}
    </View>
  );
}

const SLIDES: Slide[] = [
  {
    title: 'Hola, soy Magsave 👋',
    subtitle: 'Tu compañera para llevar las finanzas sin drama',
    illustration: <Text style={{ fontSize: 96 }}>👛</Text>,
  },
  {
    title: 'Tú mandas aquí',
    subtitle: 'Registra gastos, controla lo fijo y guarda para lo que importa',
    illustration: (
      <View className="flex-row gap-4">
        <IconBubble bg="#FBEAE3">
          <Receipt size={40} color={colors.danger} />
        </IconBubble>
        <IconBubble bg={colors.primaryDim}>
          <Repeat size={40} color={colors.primary} />
        </IconBubble>
        <IconBubble bg="#E4F4EE">
          <PiggyBank size={40} color={colors.success} />
        </IconBubble>
      </View>
    ),
  },
  {
    title: 'Todo queda aquí, solo tuyo',
    subtitle: 'Sin cuenta, sin nube, sin publicidad. Solo tú y tu plata.',
    illustration: (
      <View className="flex-row gap-4">
        <IconBubble bg={colors.primaryDim}>
          <Lock size={40} color={colors.primary} />
        </IconBubble>
        <IconBubble bg="#FBEAE3">
          <Heart size={40} color={colors.danger} />
        </IconBubble>
      </View>
    ),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.warn('No se pudo guardar el onboarding:', error);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };

  return (
    <View
      className="flex-1 bg-bg"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}>
        {SLIDES.map((slide, index) => (
          <View
            key={slide.title}
            className="items-center justify-center px-10"
            style={{ width }}>
            {page === index && (
              <>
                <Animated.View entering={FadeInDown.duration(500)}>
                  <View className="items-center">{slide.illustration}</View>
                </Animated.View>
                <Animated.Text
                  entering={FadeInUp.delay(150).duration(500)}
                  className="mt-10 text-center text-[28px] font-bold text-text-primary">
                  {slide.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.delay(300).duration(500)}
                  className="mt-3 text-center text-base text-text-secondary">
                  {slide.subtitle}
                </Animated.Text>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View className="mb-6 flex-row justify-center gap-2">
        {SLIDES.map((slide, index) => (
          <View
            key={slide.title}
            className="rounded-full"
            style={{
              width: page === index ? 22 : 8,
              height: 8,
              backgroundColor: page === index ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      <View className="px-8">
        {page === SLIDES.length - 1 ? (
          <Button label="¡Empezar!" onPress={finish} />
        ) : (
          <View className="flex-row items-center justify-between">
            <Pressable onPress={finish} hitSlop={8}>
              <Text className="text-base font-medium text-text-secondary">
                Saltar
              </Text>
            </Pressable>
            <View style={{ width: 140 }}>
              <Button label="Siguiente" onPress={next} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
