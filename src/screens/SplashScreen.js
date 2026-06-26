import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { BrandLockup } from '../components/ui';
import { useAuth } from '../auth/AuthContext';

export default function SplashScreen({ navigation }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.ready) return;
    const t = setTimeout(() => {
      if (auth.user && auth.user.role !== 'staff') {
        navigation.replace(auth.user.role === 'host' ? 'HostTabs' : 'GuestTabs');
      } else {
        navigation.replace('Auth');
      }
    }, 650);
    return () => clearTimeout(t);
  }, [auth.ready]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <BrandLockup size={54} onLight={false} tile align="center" />
      <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 }}>Events worth showing up for</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
    </View>
  );
}
