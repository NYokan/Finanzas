import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

interface Props {
  children: ReactNode;
  onDismiss?: () => void;
}

/** Bottom sheet modal con el estilo de la app y tamaño dinámico según contenido. */
export const AppSheet = forwardRef<BottomSheetModal, Props>(
  ({ children, onDismiss }, ref) => {
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.45}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        enableDynamicSizing
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onDismiss={onDismiss}
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderRadius: 28,
        }}
        handleIndicatorStyle={{ backgroundColor: '#D8D8DC', width: 44 }}>
        <BottomSheetView
          style={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 16,
          }}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AppSheet.displayName = 'AppSheet';
