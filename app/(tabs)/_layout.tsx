import { Tabs } from 'expo-router';
import { CalendarDays, History, Home, Search } from 'lucide-react-native';
import React from 'react';

import Header from '@/components/Header';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';

// Cor primária do app
const PRIMARY_COLOR = '#9076f3';

function TabBarIcon({
  Icon,
  color,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}) {
  return <Icon size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: '#565d6d',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Home} color={color} />,
          header: () => <Header title="Home" />,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Search} color={color} />,
          header: () => <Header title="Buscar" />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => (
            <TabBarIcon Icon={History} color={color} />
          ),
          header: () => <Header title="Histórico" />,
        }}
      />
      <Tabs.Screen
        name="meus-eventos"
        options={{
          title: 'Meus Eventos',
          tabBarIcon: ({ color }) => (
            <TabBarIcon Icon={CalendarDays} color={color} />
          ),
          header: () => <Header title="Meus Eventos" />,
        }}
      />
    </Tabs>
  );
}
