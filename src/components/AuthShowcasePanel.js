import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme/theme';

/**
 * React Native version of the AuthShowcasePanel.
 * Displays event photo + product proof on login/register screens.
 *
 * Composition: photo of people at an event with navy→gold wash overlay,
 * and a floating glass card showing product proof (capacity, stats, live feed).
 */

const PHOTO = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';

const STATS = [
  { key: 'checkin', icon: 'qr-code-outline', label: 'Checked in', value: '61', sub: 'at the door' },
  { key: 'rate', icon: 'trending-up', label: 'Show rate', value: '94%', sub: '+6% vs last' },
];

const FEED = [
  { who: 'Priya R.', what: 'RSVP'd · 2 seats', when: 'now' },
  { who: 'Marcus L.', what: 'checked in', when: '1m' },
];

/**
 * AuthShowcasePanel — intended for login/register page hero area.
 * In production, wrap this in a SectionList or ScrollView group section.
 * Height: 240–260pt on phone (photo + card overlap).
 */
export default function AuthShowcasePanel() {
  return (
    <View style={styles.container}>
      {/* Photo backdrop with washes */}
      <Image source={{ uri: PHOTO }} style={styles.photo} />

      {/* Navy→gold brand wash gradient — fade navy at top, open to photo, warm gold bottom */}
      <View style={styles.washOverlay} />

      {/* Bottom scrim: dark floor for text legibility */}
      <View style={styles.scrimOverlay} />

      {/* Floating product card (centered, overlapping photo + content area) */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Event header + LIVE badge */}
          <View style={styles.eventHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>Summer Rooftop Mixer</Text>
              <Text style={styles.eventMeta}>Sat, Aug 15 · Penthouse Lounge</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          {/* Capacity meter */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={styles.capacityLabel}>
              <Ionicons name="people-outline" size={11} color="rgba(255,255,255,0.68)" style={{ marginRight: 4 }} />
              <Text style={styles.capacityLabelText}>Confirmed</Text>
              <Text style={styles.capacityValue}>84 <Text style={styles.capacityMax}>/ 100</Text></Text>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {STATS.map(s => (
              <View key={s.key} style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <Ionicons name={s.icon} size={12} color="rgba(255,255,255,0.68)" />
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>

          {/* Live feed */}
          <View style={styles.feedContainer}>
            {FEED.map((f, i) => (
              <View key={i} style={[styles.feedRow, { opacity: 1 - i * 0.22 }]}>
                <View style={styles.feedDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedWho}>{f.who}</Text>
                  <Text style={styles.feedWhat}>{f.what}</Text>
                </View>
                <Text style={styles.feedWhen}>{f.when}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 260,
    overflow: 'hidden',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
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
  washOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Approximate CSS gradient as a layered approach
    // In a real app, you'd use react-native-linear-gradient or similar
    backgroundColor: 'rgba(27,51,87,0.58)',
  },
  scrimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,18,34,0.2)',
  },
  cardContainer: {
    position: 'absolute',
    top: '50%',
    left: spacing.md,
    right: spacing.md,
    marginTop: -40,
  },
  card: {
    backgroundColor: 'rgba(16,28,48,0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  eventMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52,211,153,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.42)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34d399',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6ee7b7',
    letterSpacing: 0.5,
  },
  capacityLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  capacityLabelText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.68)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  capacityValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  capacityMax: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '84%',
    borderRadius: 3,
    backgroundColor: '#E2A84A',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.68)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  feedContainer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  feedDot: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: 'rgba(52,211,153,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedWho: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  feedWhat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  feedWhen: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.5)',
  },
});
