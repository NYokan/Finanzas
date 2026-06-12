import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { TrendDown, TrendUp } from 'phosphor-react-native';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

import { AppSheet } from './AppSheet';

export interface AddActionSheetRef {
  open: () => void;
}

interface Props {
  onSelect: (type: 'expense' | 'income') => void;
}

/** Sheet del FAB: dos opciones grandes — agregar gasto / agregar ingreso. */
export const AddActionSheet = forwardRef<AddActionSheetRef, Props>(
  ({ onSelect }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.present(),
    }));

    const choose = (type: 'expense' | 'income') => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      sheetRef.current?.dismiss();
      // pequeño delay para que el sheet se cierre antes de abrir el siguiente
      setTimeout(() => onSelect(type), 250);
    };

    return (
      <AppSheet ref={sheetRef}>
        <Text className="mb-4 mt-1 text-center text-xl font-semibold text-text-primary">
          ¿Qué quieres registrar?
        </Text>
        <View className="mb-2 flex-row gap-3">
          <Pressable
            onPress={() => choose('expense')}
            className="flex-1 items-center rounded-card p-6 active:opacity-70"
            style={{ backgroundColor: colors.dangerDim }}>
            <TrendDown size={36} color={colors.danger} />
            <Text className="mt-3 text-base font-semibold text-text-primary">
              Agregar gasto
            </Text>
          </Pressable>
          <Pressable
            onPress={() => choose('income')}
            className="flex-1 items-center rounded-card p-6 active:opacity-70"
            style={{ backgroundColor: colors.successDim }}>
            <TrendUp size={36} color={colors.success} />
            <Text className="mt-3 text-base font-semibold text-text-primary">
              Agregar ingreso
            </Text>
          </Pressable>
        </View>
      </AppSheet>
    );
  },
);

AddActionSheet.displayName = 'AddActionSheet';
