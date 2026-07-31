import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

/**
 * AuthShowcasePanel (React Native) — visual-first, minimal text.
 *
 * Photo + subtle wash + live indicator. The image carries the message.
 * Clean, light, breathing room. No stats clutter, no feed wall.
 */

const PHOTO = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';

export default function AuthShowcasePanel() {
  return (
    <View style={styles.container}>
      <Image source={{ uri: PHOTO }} style={styles.photo} />

      {/* Light wash — subtle */}
      <View style={styles.wash} />

      {/* Bottom scrim for badge legibility */}
      <View style={styles.scrim} />

      {/* Live indicator — minimal */}
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>LIVE EVENT</Text>
      </View>
    </View>
  );
}

// Text component (using React Native's Text)
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27,51,87,0.25)',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(10,18,34,0.4)',
  },
  badge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34d399',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
