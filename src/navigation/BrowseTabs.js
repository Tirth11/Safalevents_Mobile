import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

import DiscoverScreen from '../screens/browse/DiscoverScreen';
import GuestExploreScreen from '../screens/guest/GuestExploreScreen';
import BrowseAccountScreen from '../screens/browse/BrowseAccountScreen';

const Tab = createBottomTabNavigator();

const ICONS = { Discover: 'home-outline', Explore: 'compass-outline', Account: 'person-circle-outline' };

// Guest Mode (no login required). Browse events freely; gated actions route to Auth.
export default function BrowseTabs() {
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
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Explore" component={GuestExploreScreen} />
      <Tab.Screen name="Account" component={BrowseAccountScreen} />
    </Tab.Navigator>
  );
}
