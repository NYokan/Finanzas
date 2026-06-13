import { Tabs } from 'expo-router';
import {
  ChartBar,
  House,
  PiggyBank,
  Receipt,
  Repeat,
  type Icon,
} from 'phosphor-react-native';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

const INACTIVE = '#B0B0B5';

// Navbar flotante: 76 % del ancho de la pantalla (≈12 % de margen en cada lado)
const { width: SCREEN_W } = Dimensions.get('window');
const NAV_W = Math.round(SCREEN_W * 0.76);
const NAV_LEFT = Math.round((SCREEN_W - NAV_W) / 2);

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
          bottom: insets.bottom + 16,
          left: NAV_LEFT,
          width: NAV_W,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarItemStyle: {
          paddingTop: 9,
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
