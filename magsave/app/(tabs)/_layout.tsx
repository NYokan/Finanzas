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

import { colors } from '@/constants/colors';

const INACTIVE = '#8E8E93';

function TabIcon({ icon: IconComponent, focused }: { icon: Icon; focused: boolean }) {
  return (
    <View
      style={{
        backgroundColor: focused ? colors.primary : 'transparent',
        padding: 12,
        borderRadius: 24,
      }}>
      <IconComponent
        size={24}
        color={focused ? '#FFFFFF' : INACTIVE}
        weight={focused ? 'fill' : 'regular'}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 40,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarItemStyle: {
          paddingTop: 11,
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
