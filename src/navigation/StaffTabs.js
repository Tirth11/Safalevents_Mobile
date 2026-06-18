import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useStore, staffCan } from '../data/mock';

import StaffCheckinScreen from '../screens/staff/StaffCheckinScreen';
import StaffGuestsScreen from '../screens/staff/StaffGuestsScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  'Check-in': 'qr-code-outline',
  Guests: 'people-outline',
  Profile: 'person-circle-outline',
};

// UC-08: the staff member only sees the tabs their role permits. A QR Scanner
// sees Check-in only; a Coordinator additionally sees Guests.
export default function StaffTabs() {
  useStore(); // re-render if the signed-in staff / permissions change
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
      {staffCan('checkin') && <Tab.Screen name="Check-in" component={StaffCheckinScreen} />}
      {staffCan('guests_view') && <Tab.Screen name="Guests" component={StaffGuestsScreen} />}
      <Tab.Screen name="Profile" component={StaffProfileScreen} />
    </Tab.Navigator>
  );
}
