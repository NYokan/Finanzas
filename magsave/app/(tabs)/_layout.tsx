import { Tabs } from 'expo-router';
import {
  ChartBar,
  House,
  PiggyBank,
  Receipt,
  Repeat,
  type Icon,
} from 'phosphor-react-native';
import { View } from 'react-native';
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

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarStyle: {
          position: 'absolute',
          // left/right simétricos: barra ancha y centrada con margen claro de
          // los bordes en cualquier dispositivo (no depende de Dimensions).
          bottom: insets.bottom + NAV_BOTTOM_GAP,
          left: NAV_SIDE_MARGIN,
          right: NAV_SIDE_MARGIN,
          height: NAV_HEIGHT,
          borderRadius: NAV_HEIGHT / 2,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        },
        tabBarItemStyle: {
          paddingTop: 10,
          paddingBottom: 6,
        },
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
