import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { Badge, Button, BrandLockup } from '../../components/ui';
import { events } from '../../data/mock';
import { useAuth, gateAction } from '../../auth/AuthContext';

const CATEGORIES = ['All', 'Party', 'Meetup', 'Fitness', 'Comedy', 'Workshop'];

const STEPS = [
  { num: '1', title: 'Create your invite', desc: 'Set the date, time, location. Pick a nice cover photo.' },
  { num: '2', title: 'Share the link', desc: 'Text it, email it, post it. One link to everything.' },
  { num: '3', title: "See who's coming", desc: 'RSVPs flow in. Send updates. Check people in at the door.' },
];

const FEATURES = [
  { icon: 'calendar-outline', title: 'Event Pages', desc: 'Beautiful pages with all the details guests need.' },
  { icon: 'ticket-outline', title: 'RSVP & Registration', desc: 'Simple, password-free RSVPs. Guest data stays clean.' },
  { icon: 'send-outline', title: 'Reminders', desc: 'Send updates to everyone at once. No group chats.' },
  { icon: 'qr-code-outline', title: 'Check-in', desc: 'QR codes at the door. Know who actually showed up.' },
  { icon: 'bar-chart-outline', title: 'Analytics', desc: 'Registrations, attendance, and capacity at a glance.' },
  { icon: 'git-network-outline', title: 'Integrations', desc: 'Connect your favorite tools via our simple API.' },
];

const TRUST = [
  { icon: 'lock-open-outline', title: 'No passwords', desc: 'OTP-only login for you and your guests.' },
  { icon: 'heart-outline', title: 'Privacy first', desc: 'Guest data only you can see.' },
  { icon: 'repeat-outline', title: 'Recurring events', desc: 'Save templates and reuse them every time.' },
];

export default function DiscoverScreen({ navigation }) {
  const auth = useAuth();
  const [cat, setCat] = useState('All');
  const list = cat === 'All' ? events : events.filter((e) => e.eventType === cat);
  const featured = events[0];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <BrandLockup size={32} />
          {auth.isAuthed ? (
            <TouchableOpacity onPress={() => navigation.navigate('GuestTabs')} style={styles.loginPill} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="person-circle" size={16} color={colors.primary} />
              <Text style={styles.loginPillTxt}>My account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.loginPill} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.loginPillTxt}>Log in / Sign up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── HERO (light) ── */}
        <View style={styles.hero}>
          <View style={{ alignItems: 'center' }}>
            <Badge tone="primary" label="Browse freely · no account needed" />
            <Text style={styles.heroTitle}>
              The effortless way to <Text style={{ color: colors.primary }}>host</Text>.
            </Text>
            <Text style={styles.heroSub}>
              Design refined invitations, manage guest responses, and coordinate every detail — all in one place. Start at no cost.
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignSelf: 'stretch' }}>
              <Button label="Explore events" icon="compass" onPress={() => navigation.navigate('Explore')} style={{ flex: 1 }} />
              {!auth.isAuthed && (
                <Button label="Sign up" variant="outline" onPress={() => navigation.navigate('Auth')} style={{ flex: 1 }} />
              )}
            </View>
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works — simple, refined</Text>
          <Text style={styles.sectionSub}>Create, share, done. No phone calls. No spreadsheets.</Text>
          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {STEPS.map((s) => (
              <View key={s.num} style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{s.num}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{ fontWeight: '800', fontSize: 15, color: colors.text }} numberOfLines={1}>{s.title}</Text>
                  <Text style={[font.small, { marginTop: spacing.xs, lineHeight: 19 }]}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── FEATURES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything you need to host</Text>
          <Text style={styles.sectionSub}>Refined tools for a seamless event. Nothing unnecessary.</Text>
          <View style={styles.featGrid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featCard}>
                <View style={styles.featIcon}>
                  <Ionicons name={f.icon} size={20} color={colors.primary} />
                </View>
                <Text style={{ fontWeight: '800', fontSize: 14, color: colors.text, marginTop: spacing.sm }} numberOfLines={1}>{f.title}</Text>
                <Text style={[font.tiny, { marginTop: spacing.xs, lineHeight: 16 }]}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TRUST STRIP ── */}
        <View style={styles.section}>
          <View style={styles.trustStrip}>
            {TRUST.map((t, i) => (
              <View key={t.title} style={[styles.trustItem, i < TRUST.length - 1 && styles.trustDivider]}>
                <Ionicons name={t.icon} size={18} color={colors.accent} />
                <Text style={{ fontWeight: '800', fontSize: 12.5, color: colors.text, marginTop: spacing.xs, textAlign: 'center' }} numberOfLines={1}>{t.title}</Text>
                <Text style={[font.tiny, { textAlign: 'center', marginTop: 2, lineHeight: 15 }]}>{t.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── EVENTS (pushed down) ── */}
        <View style={{ marginTop: spacing.sm }}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg }]}>Discover events near you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipActive]}>
                <Text style={{ color: cat === c ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            {list.map((e) => (
              <TouchableOpacity key={e.id} activeOpacity={0.9} onPress={() => navigation.navigate('GuestEventDetail', { eventId: e.id })} style={styles.card}>
                <Image source={{ uri: e.cover }} style={styles.cardImg} />
                <View style={{ flex: 1, padding: spacing.md }}>
                  <Text style={{ fontWeight: '800', fontSize: 15, color: colors.text }} numberOfLines={1}>{e.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                    <Ionicons name="star" size={12} color="#f5a623" />
                    <Text style={font.tiny} numberOfLines={1}>{e.rating} · {e.eventType}</Text>
                  </View>
                  <Text style={[font.tiny, { marginTop: 2 }]} numberOfLines={1}>{e.date} · {e.city}</Text>
                  <Text style={[font.tiny, { marginTop: 2 }]} numberOfLines={1}>Hosted by {e.hostName}</Text>
                </View>
                <TouchableOpacity onPress={() => gateAction(auth, navigation, { nav: 'GuestTabs' })} style={styles.saveBtn} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="bookmark-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Host CTA (gated) */}
        <View style={styles.hostCta}>
          <Ionicons name="sparkles" size={22} color={colors.primary} />
          <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginTop: spacing.sm }}>Hosting something?</Text>
          <Text style={[font.small, { textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 19 }]}>Create an event, manage RSVPs, and invite your team.</Text>
          <Button label="Host an event" icon="add" onPress={() => gateAction(auth, navigation, { nav: 'HostCreateEvent', role: 'host' })} style={{ alignSelf: 'stretch' }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10 },
  loginPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  loginPillTxt: { color: colors.primary, fontWeight: '700', fontSize: 12.5 },

  // Light, airy hero
  hero: { margin: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primaryTint, borderWidth: 1, borderColor: colors.border },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: '800', marginTop: 14, lineHeight: 33, textAlign: 'center', letterSpacing: -0.5 },
  heroSub: { color: colors.textMuted, fontSize: 13.5, marginTop: 10, lineHeight: 20, textAlign: 'center' },

  previewCard: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow },
  previewImg: { width: '100%', height: 120, backgroundColor: colors.surfaceHover },
  previewStatRow: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  previewStat: { flex: 1, alignItems: 'center' },
  previewStatNum: { fontSize: 18, fontWeight: '800', color: colors.text },

  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  sectionSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },

  stepRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  featCard: { width: '47.5%', flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  featIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },

  trustStrip: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.md },
  trustItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: spacing.sm },
  trustDivider: { borderRightWidth: 1, borderRightColor: colors.border },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  card: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.md, ...shadow },
  cardImg: { width: 104, alignSelf: 'stretch', minHeight: 104, backgroundColor: colors.surfaceHover },
  saveBtn: { padding: spacing.md, justifyContent: 'center', alignItems: 'center' },
  hostCta: { margin: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
});
