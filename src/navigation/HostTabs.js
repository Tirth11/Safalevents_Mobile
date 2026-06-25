import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

import HostDashboardScreen from '../screens/host/HostDashboardScreen';
import HostEventsScreen from '../screens/host/HostEventsScreen';
import HostGuestsScreen from '../screens/host/HostGuestsScreen';
import HostMessagesScreen from '../screens/host/HostMessagesScreen';
import HostAccountScreen from '../screens/host/HostAccountScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard: 'grid-outline',
  Events: 'calendar-outline',
  Guests: 'people-outline',
  Messages: 'chatbubbles-outline',
  Account: 'person-circle-outline',
};

export default function HostTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={HostDashboardScreen} />
      <Tab.Screen name="Events" component={HostEventsScreen} />
      <Tab.Screen name="Guests" component={HostGuestsScreen} />
      <Tab.Screen name="Messages" component={HostMessagesScreen} />
      <Tab.Screen name="Account" component={HostAccountScreen} />
    </Tab.Navigator>
  );
}
