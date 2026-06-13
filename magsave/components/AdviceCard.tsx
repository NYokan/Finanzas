import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import type { Advice, AdviceTone } from '@/utils/advisor';

const TONE_COLORS: Record<AdviceTone, { fg: string; bg: string }> = {
  info: { fg: colors.primary, bg: colors.primaryDim },
  warn: { fg: colors.warning, bg: colors.warningDim },
  win: { fg: colors.success, bg: colors.successDim },
};

interface Props {
  advice: Advice;
  /** versión banner: cuerpo truncado a 2 líneas; tocar abre el detalle completo */
  compact?: boolean;
}

/**
 * Card de un consejo del motor local. Al tocarla abre un modal centrado
 * (efecto "focus") con el texto completo, esquinas redondeadas y el fondo
 * atenuado. El feedback de press usa escala (no opacidad) para evitar el
 * artefacto rectangular de Android al animar opacidad sobre vistas con
 * elevation.
 */
export function AdviceCard({ advice, compact = false }: Props) {
  const [focused, setFocused] = useState(false);
  const tone = TONE_COLORS[advice.tone];
  const IconComponent = advice.icon;

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setFocused(true);
        }}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
        <Card style={compact ? { paddingVertical: 14 } : undefined}>
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 38, height: 38, backgroundColor: tone.bg }}>
              <IconComponent size={20} color={tone.fg} weight="duotone" />
            </View>
            <View className="flex-1">
              <Text
                className="font-sans text-sm font-semibold text-text-primary"
                numberOfLines={1}>
                {advice.title}
              </Text>
              <Text
                className="font-sans mt-0.5 text-sm text-text-secondary"
                numberOfLines={compact ? 2 : undefined}>
                {advice.body}
              </Text>
            </View>
          </View>
        </Card>
      </Pressable>

      <Modal
        visible={focused}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFocused(false)}>
        {/* Fondo atenuado: tocar fuera cierra */}
        <Pressable
          onPress={() => setFocused(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            paddingHorizontal: 28,
          }}>
          {/* Tarjeta de detalle. View plana con borderRadius explícito y sin
              elevation para que no aparezca el cuadrado gris en Android. */}
          <Pressable
            onPress={() => {}}
            style={{
              borderRadius: 28,
              backgroundColor: colors.surface,
              paddingVertical: 28,
              paddingHorizontal: 24,
            }}>
            <View className="items-center">
              <View
                className="items-center justify-center rounded-full"
                style={{ width: 60, height: 60, backgroundColor: tone.bg }}>
                <IconComponent size={32} color={tone.fg} weight="duotone" />
              </View>
              <Text className="font-sans mt-4 text-center text-lg font-bold text-text-primary">
                {advice.title}
              </Text>
              <Text className="font-sans mt-2 text-center text-base leading-6 text-text-secondary">
                {advice.body}
              </Text>
              <Pressable
                onPress={() => setFocused(false)}
                style={({ pressed }) => ({
                  marginTop: 24,
                  paddingVertical: 11,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  backgroundColor: tone.bg,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <Text className="font-sans font-semibold" style={{ color: tone.fg }}>
                  Entendido
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
