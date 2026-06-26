import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { View, Text } from 'react-native';

import { AuthProvider } from './src/auth/AuthContext';
import PhoneFrame from './src/components/PhoneFrame';

import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HostTabs from './src/navigation/HostTabs';
import GuestTabs from './src/navigation/GuestTabs';
import StaffTabs from './src/navigation/StaffTabs';

import HostEventManageScreen from './src/screens/host/HostEventManageScreen';
import HostCreateEventScreen from './src/screens/host/HostCreateEventScreen';
import HostNotificationsScreen from './src/screens/host/HostNotificationsScreen';
import IntegrationsScreen from './src/screens/host/IntegrationsScreen';
import StaffRolesScreen from './src/screens/host/StaffRolesScreen';

import GuestEventDetailScreen from './src/screens/guest/GuestEventDetailScreen';
import GuestRsvpScreen from './src/screens/guest/GuestRsvpScreen';
import GuestTicketPassScreen from './src/screens/guest/GuestTicketPassScreen';
import GuestChatScreen from './src/screens/guest/GuestChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PhoneFrame>
          <StatusBar style="dark" />
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              {/* Login-first: Auth is the entry point after install (no guest landing) */}
              <Stack.Screen name="Auth" component={AuthScreen} />

              {/* Authenticated flows */}
              <Stack.Screen name="HostTabs" component={HostTabs} />
              <Stack.Screen name="GuestTabs" component={GuestTabs} />
              <Stack.Screen name="StaffTabs" component={StaffTabs} />

              {/* Host pushed screens */}
              <Stack.Screen name="HostEventManage" component={HostEventManageScreen} />
              <Stack.Screen name="HostCreateEvent" component={HostCreateEventScreen} />
              <Stack.Screen name="HostNotifications" component={HostNotificationsScreen} />
              <Stack.Screen name="Integrations" component={IntegrationsScreen} />
              <Stack.Screen name="StaffRoles" component={StaffRolesScreen} />

              {/* Shared / guest pushed screens (reachable while browsing) */}
              <Stack.Screen name="GuestEventDetail" component={GuestEventDetailScreen} />
              <Stack.Screen name="GuestRsvp" component={GuestRsvpScreen} />
              <Stack.Screen name="GuestTicketPass" component={GuestTicketPassScreen} />
              <Stack.Screen name="GuestChat" component={GuestChatScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PhoneFrame>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
