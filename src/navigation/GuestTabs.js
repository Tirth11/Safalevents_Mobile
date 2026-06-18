import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

import GuestTicketsScreen from '../screens/guest/GuestTicketsScreen';
import GuestExploreScreen from '../screens/guest/GuestExploreScreen';
import GuestMessagesScreen from '../screens/guest/GuestMessagesScreen';
import GuestProfileScreen from '../screens/guest/GuestProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Tickets: 'ticket-outline',
  Explore: 'compass-outline',
  Messages: 'chatbubbles-outline',
  Profile: 'person-circle-outline',
};

export default function GuestTabs() {
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
      <Tab.Screen name="Tickets" component={GuestTicketsScreen} />
      <Tab.Screen name="Explore" component={GuestExploreScreen} />
      <Tab.Screen name="Messages" component={GuestMessagesScreen} />
      <Tab.Screen name="Profile" component={GuestProfileScreen} />
    </Tab.Navigator>
  );
}
