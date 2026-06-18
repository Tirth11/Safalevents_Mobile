import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  SectionTitle,
  Row,
  Divider,
  Field,
  ToggleRow,
  ScreenHeader,
} from '../../components/ui';

export default function HostCreateEventScreen({ navigation, route }) {
  const publish = () => {
    Alert.alert('Event published', 'Prototype — your event would now be live.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title="Create event" onBack={() => navigation.goBack()} />

      <SectionTitle>Details</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Field label="Event title" placeholder="e.g. Summer Rooftop Mixer" />
        <Field label="Event type" placeholder="Party, Meetup, Fitness…" />
        <Field label="Date" placeholder="YYYY-MM-DD" />
        <Field label="Time" placeholder="19:00" />
        <Field label="Location" placeholder="Venue, City, State" />
        <Field label="Description" placeholder="Tell guests what to expect…" multiline />
      </Card>

      <SectionTitle>Capacity & tickets</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Field label="Max capacity" placeholder="100" keyboardType="numeric" />
        <Field label="Ticket price" placeholder="0" keyboardType="numeric" />
      </Card>

      <SectionTitle>Options</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <ToggleRow
          label="Require RSVP approval"
          desc="Hold RSVPs as Under Approval"
          value={false}
          icon="shield-checkmark-outline"
        />
        <ToggleRow label="Allow guest messaging" desc="Let guests message you" value icon="chatbubbles-outline" />
        <ToggleRow label="Allow comments" desc="Public comments on the event" value={false} icon="create-outline" />
        <ToggleRow label="Paid ticket" desc="Charge guests for entry" value={false} icon="card-outline" />
      </Card>

      <SectionTitle>Custom questions</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Field label="Question 1" placeholder="e.g. Any food allergies?" />
        <Field label="Question 2" placeholder="e.g. Song request for the DJ?" />
      </Card>

      <Button label="Publish event" variant="primary" icon="checkmark-circle" onPress={publish} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
});
