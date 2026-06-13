import { Tabs } from 'expo-router';
import {
  ChartBar,
  House,
  PiggyBank,
  Receipt,
  Repeat,
  type Icon,
} from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { NAV_BOTTOM_GAP, NAV_HEIGHT, NAV_SIDE_MARGIN } from '@/constants/layout';

const INACTIVE = '#B0B0B5';

function TabIcon({ icon: IconComponent, focused }: { icon: Icon; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <IconComponent
        size={24}
        color={focused ? colors.primary : INACTIVE}
        weight={focused ? 'fill' : 'regular'}
      />
      {/* Indicador subrayado del tab activo */}
      <View
        style={{
          marginTop: 3,
          width: 16,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: focused ? colors.primary : 'transparent',
        }}
      />
    </View>
  );
}

// Tipo mínimo de lo que usamos de las props del tab bar (evita imports frágiles
// a rutas internas de expo-router).
interface FloatingTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (p: { focused: boolean; color: string; size: number }) => ReactNode;
      };
    }
  >;
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

/**
 * Navbar flotante propia. El contenedor externo ocupa todo el ancho con
 * `paddingHorizontal`, así la barra interna queda SIEMPRE separada de los
 * bordes por NAV_SIDE_MARGIN y es imposible que se desborde (a diferencia de
 * left/right en tabBarStyle, que react-navigation no respeta de forma fiable).
 */
function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + NAV_BOTTOM_GAP,
        paddingHorizontal: NAV_SIDE_MARGIN,
      }}>
      <View
        style={{
          flexDirection: 'row',
          height: NAV_HEIGHT,
          borderRadius: NAV_HEIGHT / 2,
          backgroundColor: colors.surface,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 8,
              }}>
              {options.tabBarIcon?.({
                focused,
                color: focused ? colors.primary : INACTIVE,
                size: 24,
              })}
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: '500',
                  marginTop: 3,
                  color: focused ? colors.primary : INACTIVE,
                }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as unknown as FloatingTabBarProps)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon icon={House} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: 'Gastos',
          tabBarIcon: ({ focused }) => <TabIcon icon={Receipt} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fijos"
        options={{
          title: 'Fijos',
          tabBarIcon: ({ focused }) => <TabIcon icon={Repeat} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ahorro"
        options={{
          title: 'Ahorro',
          tabBarIcon: ({ focused }) => <TabIcon icon={PiggyBank} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ focused }) => <TabIcon icon={ChartBar} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
