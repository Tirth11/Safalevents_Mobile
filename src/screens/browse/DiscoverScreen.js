import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { Badge, Button } from '../../components/ui';
import { events } from '../../data/mock';
import { useAuth, gateAction } from '../../auth/AuthContext';

const CATEGORIES = ['All', 'Party', 'Meetup', 'Fitness', 'Comedy', 'Workshop'];

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>SafalEvents</Text>
          </View>
          {auth.isAuthed ? (
            <TouchableOpacity onPress={() => navigation.navigate('GuestTabs')} style={styles.loginPill}>
              <Ionicons name="person-circle" size={16} color={colors.primary} />
              <Text style={styles.loginPillTxt}>My account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.loginPill}>
              <Text style={styles.loginPillTxt}>Log in / Sign up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: featured.cover }} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,8,20,0.55)' }]} />
          <View style={{ padding: spacing.lg }}>
            <Badge tone="primary" label="Browse freely · no account needed" />
            <Text style={styles.heroTitle}>Discover events worth showing up for</Text>
            <Text style={styles.heroSub}>Explore everything as a guest. Create an account only when you RSVP.</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Button label="Explore events" icon="compass" onPress={() => navigation.navigate('Explore')} style={{ flex: 1 }} />
              {!auth.isAuthed && (
                <Button label="Sign up" variant="outline" onPress={() => navigation.navigate('Auth')} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)' }} />
              )}
            </View>
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg }} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipActive]}>
              <Text style={{ color: cat === c ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Event list */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={[font.h3, { marginBottom: spacing.md }]}>{cat === 'All' ? 'Trending near you' : cat + ' events'}</Text>
          {list.map((e) => (
            <TouchableOpacity key={e.id} activeOpacity={0.9} onPress={() => navigation.navigate('GuestEventDetail', { eventId: e.id })} style={styles.card}>
              <Image source={{ uri: e.cover }} style={styles.cardImg} />
              <View style={{ flex: 1, padding: 12 }}>
                <Text style={{ fontWeight: '800', fontSize: 15, color: colors.text }} numberOfLines={1}>{e.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="star" size={12} color="#f5a623" />
                  <Text style={font.tiny}>{e.rating} · {e.eventType}</Text>
                </View>
                <Text style={font.tiny} numberOfLines={1}>{e.date} · {e.city}</Text>
                <Text style={font.tiny} numberOfLines={1}>Hosted by {e.hostName}</Text>
              </View>
              {/* Save is a gated action */}
              <TouchableOpacity
                onPress={() => gateAction(auth, navigation, { nav: 'GuestTabs' })}
                style={styles.saveBtn}
                hitSlop={8}
              >
                <Ionicons name="bookmark-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Host CTA (gated) */}
        <View style={styles.hostCta}>
          <Ionicons name="sparkles" size={22} color={colors.primary} />
          <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginTop: 8 }}>Hosting something?</Text>
          <Text style={[font.small, { textAlign: 'center', marginVertical: 6 }]}>Create an event, manage RSVPs, and invite your team.</Text>
          <Button label="Host an event" icon="add" onPress={() => gateAction(auth, navigation, { nav: 'HostCreateEvent', role: 'host' })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10 },
  logo: { width: 32, height: 32 },
  loginPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  loginPillTxt: { color: colors.primary, fontWeight: '700', fontSize: 12.5 },
  hero: { marginHorizontal: spacing.lg, borderRadius: radius.lg, overflow: 'hidden', minHeight: 230, justifyContent: 'flex-end', ...shadow },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 10, lineHeight: 29 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13.5, marginTop: 6, lineHeight: 19 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  card: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 12, ...shadow },
  cardImg: { width: 104, alignSelf: 'stretch', minHeight: 104, backgroundColor: colors.surfaceHover },
  saveBtn: { padding: 12, justifyContent: 'center' },
  hostCta: { margin: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
});
