import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import RoleSelectScreen from './src/screens/RoleSelectScreen';
import HostTabs from './src/navigation/HostTabs';
import GuestTabs from './src/navigation/GuestTabs';
import StaffTabs from './src/navigation/StaffTabs';

import HostEventManageScreen from './src/screens/host/HostEventManageScreen';
import HostCreateEventScreen from './src/screens/host/HostCreateEventScreen';
import HostNotificationsScreen from './src/screens/host/HostNotificationsScreen';

import GuestEventDetailScreen from './src/screens/guest/GuestEventDetailScreen';
import GuestRsvpScreen from './src/screens/guest/GuestRsvpScreen';
import GuestTicketPassScreen from './src/screens/guest/GuestTicketPassScreen';
import GuestChatScreen from './src/screens/guest/GuestChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="RoleSelect" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="HostTabs" component={HostTabs} />
          <Stack.Screen name="GuestTabs" component={GuestTabs} />
          <Stack.Screen name="StaffTabs" component={StaffTabs} />

          {/* Host pushed screens */}
          <Stack.Screen name="HostEventManage" component={HostEventManageScreen} />
          <Stack.Screen name="HostCreateEvent" component={HostCreateEventScreen} />
          <Stack.Screen name="HostNotifications" component={HostNotificationsScreen} />

          {/* Guest pushed screens */}
          <Stack.Screen name="GuestEventDetail" component={GuestEventDetailScreen} />
          <Stack.Screen name="GuestRsvp" component={GuestRsvpScreen} />
          <Stack.Screen name="GuestTicketPass" component={GuestTicketPassScreen} />
          <Stack.Screen name="GuestChat" component={GuestChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
