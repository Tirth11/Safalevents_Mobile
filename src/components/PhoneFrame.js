import React from 'react';
import { View, Text, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

const PAD = 10;        // device bezel padding
const STATUS_H = 34;   // reserved status bar

// On native, render full-screen. On web, center the app inside a phone-sized frame.
// The app content gets an EXPLICIT pixel height (frame − bezel − status bar) so the
// bottom tab bar stays inside the device instead of overflowing below it.
export default function PhoneFrame({ children }) {
  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  const { height } = useWindowDimensions();
  const frameH = Math.min(900, Math.max(600, height - 28));
  const frameW = Math.round((frameH * 412) / 892);
  const innerH = frameH - PAD * 2;          // rounded screen area
  const contentH = innerH - STATUS_H;       // app content area (explicit)

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#160f24', padding: 14 }}>
      <View
        style={{
          width: frameW,
          height: frameH,
          maxWidth: '100%',
          borderRadius: 46,
          backgroundColor: '#0a0a0a',
          padding: PAD,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        <View style={{ width: frameW - PAD * 2, height: innerH, borderRadius: 38, overflow: 'hidden', backgroundColor: colors.bg }}>
          {/* Reserved status bar */}
          <View style={{ height: STATUS_H, backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12.5 }}>9:41</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="cellular" size={13} color="#fff" />
              <Ionicons name="wifi" size={14} color="#fff" />
              <Ionicons name="battery-full" size={16} color="#fff" />
            </View>
          </View>
          {/* App content — explicit height keeps the bottom tab bar inside the frame */}
          <View style={{ height: contentH, width: '100%' }}>{children}</View>
        </View>
      </View>
      <Text style={{ color: '#7a7682', marginTop: 14, fontSize: 13, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' }}>
        © 2026 Safalvir Inc. All rights reserved.
      </Text>
    </View>
  );
}
