import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/theme';

/**
 * The strip above the auth form, matching the web login/signup panel.
 *
 * No photograph and no sample event card — earlier photo versions needed dark
 * overlays to keep text legible, which fought the light look. A warm golden
 * ground with dark copy needs no scrim at all.
 *
 * React Native has no CSS gradients, so the web panel's layered blooms are
 * approximated with a flat cream fill plus one soft gold corner block. Adding
 * expo-linear-gradient just for this wasn't worth a new dependency.
 */

const PROOF = [
  'Polished event pages in minutes',
  'Every RSVP tracked in one place',
  'Confident check-in at the door',
];

export default function AuthShowcasePanel({ compact = false }) {
  return (
    <View style={styles.panel}>
      {/* Warm corner, stands in for the web gold bloom */}
      <View style={styles.bloom} pointerEvents="none" />

      <Text style={styles.eyebrow}>PLAN · INVITE · CELEBRATE</Text>
      <Text style={styles.heading}>
        Every event deserves a beautiful beginning
        <Text style={styles.headingAccent}> and awesome execution.</Text>
      </Text>

      {!compact ? (
        <>
          <Text style={styles.body}>
            Create polished event pages, manage every RSVP, and welcome your
            guests &amp; attendees with confidence.
          </Text>

          <View style={styles.proof}>
            {PROOF.map((item) => (
              <View key={item} style={styles.proofRow}>
                <View style={styles.tick}>
                  <Ionicons name="checkmark" size={11} color="#00753a" />
                </View>
                <Text style={styles.proofText}>{item}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#fdf7ea',
  },
  bloom: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(194,140,50,0.16)',
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: colors.primary,
  },
  heading: {
    marginTop: 9,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
    letterSpacing: -0.5,
    color: '#101c36',
  },
  headingAccent: { color: '#b07d22' },
  body: {
    marginTop: 11,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: '#3f4550',
  },
  proof: {
    marginTop: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(166,118,38,0.22)',
  },
  proofRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  tick: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: 'rgba(0,161,82,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  proofText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: '#232b3a' },
});
