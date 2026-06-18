import React from 'react';
import { View, Text, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

// On native, render full-screen. On web, center the whole app inside a phone-sized
// device frame so the mobile UI looks like a real handset in the browser.
// IMPORTANT: the status bar is a *reserved* strip (not an overlay) so screen
// content always starts below it — nothing is clipped under a notch.
export default function PhoneFrame({ children }) {
  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  const { height } = useWindowDimensions();
  const frameH = Math.min(900, Math.max(600, height - 28));
  const frameW = Math.round((frameH * 412) / 892); // iPhone-ish aspect ratio

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#160f24',
        padding: 14,
      }}
    >
      <View
        style={{
          width: frameW,
          height: frameH,
          maxWidth: '100%',
          borderRadius: 46,
          backgroundColor: '#0a0a0a',
          padding: 10,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        <View style={{ flex: 1, borderRadius: 38, overflow: 'hidden', backgroundColor: colors.bg }}>
          {/* Reserved status bar (iOS-style) */}
          <View
            style={{
              height: 34,
              backgroundColor: '#000',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 22,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>9:41</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="cellular" size={13} color="#fff" />
              <Ionicons name="wifi" size={14} color="#fff" />
              <Ionicons name="battery-full" size={16} color="#fff" />
            </View>
          </View>
          {/* App content fills the rest */}
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </View>
    </View>
  );
}
