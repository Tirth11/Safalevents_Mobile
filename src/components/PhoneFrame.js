import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { colors } from '../theme/theme';

// On native, render full-screen. On web, center the whole app inside a phone-sized
// device frame so the mobile UI looks like a real handset in the browser.
export default function PhoneFrame({ children }) {
  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  const { height } = useWindowDimensions();
  const frameH = Math.min(880, Math.max(560, height - 32));
  const frameW = Math.round((frameH * 410) / 880); // keep a phone aspect ratio

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#160f24',
        padding: 16,
      }}
    >
      <View
        style={{
          width: frameW,
          height: frameH,
          maxWidth: '100%',
          borderRadius: 44,
          backgroundColor: '#000',
          padding: 10,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        <View style={{ flex: 1, borderRadius: 36, overflow: 'hidden', backgroundColor: colors.bg, position: 'relative' }}>
          {/* notch */}
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 50 }}
          >
            <View style={{ width: 150, height: 26, backgroundColor: '#000', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} />
          </View>
          {children}
        </View>
      </View>
    </View>
  );
}
