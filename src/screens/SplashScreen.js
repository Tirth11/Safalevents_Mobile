import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useAuth } from '../auth/AuthContext';

// Brief branded splash. Routes a remembered user straight to their flow,
// otherwise lands in Guest Mode (Browse) — no login wall (UC-14).
export default function SplashScreen({ navigation }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.ready) return;
    const t = setTimeout(() => {
      if (auth.user && auth.user.role !== 'staff') {
        navigation.replace(auth.user.role === 'host' ? 'HostTabs' : 'GuestTabs');
      } else {
        navigation.replace('Browse');
      }
    }, 650);
    return () => clearTimeout(t);
  }, [auth.ready]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Ionicons name="calendar" size={34} color="#fff" />
      </View>
      <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>SafalEvents</Text>
      <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>Events worth showing up for</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
    </View>
  );
}
