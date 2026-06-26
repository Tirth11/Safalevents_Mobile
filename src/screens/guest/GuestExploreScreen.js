import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  SectionTitle,
  Avatar,
  Row,
  Divider,
  TextField,
} from '../../components/ui';
import { events } from '../../data/mock';

const CATEGORIES = ['All', 'Party', 'Meetup', 'Fitness', 'Comedy'];

export default function GuestExploreScreen({ navigation, route }) {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const list = events.filter((e) => {
    const matchesCat = activeCat === 'All' || e.eventType.toLowerCase() === activeCat.toLowerCase();
    const matchesSearch = !search.trim() ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.hostName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Screen>
      <Text style={[font.h1, { marginBottom: spacing.md }]}>Explore</Text>

      <TextField
        placeholder="Search events, venues, hosts…"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: spacing.lg }}
      >
        <Row>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => setActiveCat(cat)}
              style={{ marginRight: spacing.sm }}
            >
              <Badge tone={activeCat === cat ? 'primary' : 'gray'} label={cat} />
            </TouchableOpacity>
          ))}
        </Row>
      </ScrollView>

      {list.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
          <Ionicons name="search-outline" size={38} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
          <Text style={[font.body, { color: colors.textMuted }]}>No events match your criteria</Text>
        </View>
      ) : (
        list.map((e) => (
          <Card
            key={e.id}
            padded={false}
            style={styles.eventCard}
            onPress={() => navigation.navigate('GuestEventDetail', { eventId: e.id })}
          >
            <Image source={{ uri: e.cover }} style={styles.cover} />
            <View style={{ padding: spacing.lg }}>
              <Text style={font.h3} numberOfLines={1}>
                {e.title}
              </Text>
              <Row style={[styles.between, { marginTop: spacing.sm }]}>
                <Row>
                  <Ionicons name="star" size={14} color={colors.amber} />
                  <Text style={[font.small, { marginLeft: spacing.xs, color: colors.text, fontWeight: '700' }]}>
                    {e.rating}
                  </Text>
                </Row>
                <Badge tone="blue" label={e.eventType} />
              </Row>
              <Row style={{ marginTop: spacing.sm }}>
                <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                <Text style={[font.small, { marginLeft: spacing.xs, flex: 1 }]} numberOfLines={1}>
                  {e.date} • {e.location}
                </Text>
              </Row>
              <Divider style={{ marginVertical: spacing.sm }} />
              <Row>
                <Avatar seed={e.hostName} size={22} />
                <Text style={[font.small, { marginLeft: spacing.sm, flex: 1 }]} numberOfLines={1}>
                  Hosted by {e.hostName}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Row>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

export { GuestExploreScreen };

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  eventCard: { marginBottom: spacing.lg, overflow: 'hidden' },
  cover: { width: '100%', height: 150, backgroundColor: colors.surfaceHover },
});
