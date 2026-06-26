import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import {
  Screen,
  Card,
  Button,
  SectionTitle,
  Avatar,
  Row,
  Divider,
  Toggle,
  Tabs,
  TextField,
} from '../../components/ui';
import {
  useStore,
  getCurrentHost,
} from '../../data/mock';
import { useAuth } from '../../auth/AuthContext';

const SETTINGS_TABS = [
  { key: 'general', label: 'General Settings' },
  { key: 'automation', label: 'Automation & Security' },
];

export default function HostAccountScreen({ navigation }) {
  useStore();
  const auth = useAuth();
  const host = getCurrentHost();

  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [displayName, setDisplayName] = useState(host.name || 'Alex Rivera');
  const [email, setEmail] = useState(host.email || 'alex@safalevent.com');
  const [phone, setPhone] = useState(host.phone || '+1 (555) 999-8888');
  const [currency, setCurrency] = useState('US Dollar ($)');

  // Automation & Security State
  const [detectOverRsvp, setDetectOverRsvp] = useState(true);
  const [variance, setVariance] = useState('50');
  const [triggerAfter, setTriggerAfter] = useState('3');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [sendInApp, setSendInApp] = useState(true);

  const saveGeneral = () => {
    Alert.alert('Settings Saved', 'Your general settings have been updated.');
  };

  const savePolicy = () => {
    Alert.alert('Policy Saved', 'Your guest attendance policies have been updated.');
  };

  const submitDocs = () => {
    Alert.alert('Submitted for Review', 'A Safal Events admin will review your documents before your organization can host events.');
  };

  return (
    <Screen>
      <View style={{ paddingBottom: spacing.md }}>
        <Text style={font.h1}>Organizer Settings</Text>
        <Text style={[font.small, { color: colors.textMuted, marginTop: 4 }]}>Configure default host profile settings and brand styles.</Text>
      </View>

      <Tabs tabs={SETTINGS_TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <View style={{ marginTop: spacing.md }}>
          <SectionTitle>Profile Photo</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { color: colors.textMuted, marginBottom: spacing.md }]}>
              This is how guests see you across invitations and event pages. No photo is shown until you upload one.
            </Text>
            <Row style={{ alignItems: 'center' }}>
              <Avatar seed={host.name} size={64} />
              <View style={{ marginLeft: spacing.md }}>
                <Button 
                  label="Upload photo" 
                  variant="outline" 
                  icon="cloud-upload-outline" 
                  small 
                  onPress={() => Alert.alert('Upload Photo', 'Prototype: Photo picker would open here.')} 
                />
              </View>
            </Row>
          </Card>

          <SectionTitle>Contact Details</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <TextField 
              label="Host Display Name" 
              value={displayName} 
              onChangeText={setDisplayName} 
              placeholder="e.g. Alex Rivera" 
            />
            <TextField 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              placeholder="name@safalevent.com" 
              keyboardType="email-address" 
            />
            <TextField 
              label="Contact Phone" 
              value={phone} 
              onChangeText={setPhone} 
              placeholder="+1 (555) 000-0000" 
            />
          </Card>

          <SectionTitle>Payout Preferences</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <TextField 
              label="Payout Currency" 
              value={currency} 
              onChangeText={setCurrency} 
              placeholder="US Dollar ($)" 
            />
            <Text style={[font.tiny, { color: colors.textMuted, marginTop: -8 }]}>
              All earnings and revenue across your dashboard display in this currency. Currently showing $1,234.
            </Text>
          </Card>

          <Button 
            label="Save Changes" 
            variant="primary" 
            onPress={saveGeneral} 
            style={{ marginBottom: spacing.xl }}
          />
        </View>
      )}

      {activeTab === 'automation' && (
        <View style={{ marginTop: spacing.md }}>
          <SectionTitle>Guest Attendance Policies</SectionTitle>
          <Text style={[font.small, { color: colors.textMuted, marginBottom: spacing.md }]}>
            Automatically flag and manage guests with low RSVP reliability.
          </Text>
          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle 
              label="Detect Repeated Over-RSVP Behaviour" 
              value={detectOverRsvp} 
              onValueChange={setDetectOverRsvp} 
              icon="alert-circle-outline" 
            />
            {detectOverRsvp && (
              <View style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceHover, borderRadius: radius.md }}>
                <Row style={{ gap: spacing.md }}>
                  <TextField 
                    half 
                    label="Variance Threshold (%)" 
                    value={variance} 
                    onChangeText={setVariance} 
                    keyboardType="numeric" 
                  />
                  <TextField 
                    half 
                    label="Trigger After (Events)" 
                    value={triggerAfter} 
                    onChangeText={setTriggerAfter} 
                    keyboardType="numeric" 
                  />
                </Row>
                <Divider style={{ marginVertical: spacing.md }} />
                <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm }]}>Automatic Actions</Text>
                <Toggle 
                  label="Send Email Reminder" 
                  value={sendEmail} 
                  onValueChange={setSendEmail} 
                  icon="mail-outline" 
                />
                <Toggle 
                  label="Send SMS Reminder" 
                  value={sendSms} 
                  onValueChange={setSendSms} 
                  icon="chatbubble-outline" 
                />
                <Toggle 
                  label="Send In-App Notification" 
                  value={sendInApp} 
                  onValueChange={setSendInApp} 
                  icon="notifications-outline" 
                />
              </View>
            )}
            <Button 
              label="Save Policy" 
              variant="outline" 
              onPress={savePolicy} 
              style={{ marginTop: spacing.md }}
            />
          </Card>

          <SectionTitle>Organization Documents</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { marginBottom: spacing.md }]}>
              View or upload your organization documents
            </Text>
            
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.uploadBox} 
              onPress={() => Alert.alert('Upload', 'Select document file...')}
            >
              <Ionicons name="document-attach-outline" size={32} color={colors.primary} />
              <Text style={{ marginTop: spacing.sm, fontWeight: '700', color: colors.primary }}>Click to upload documents</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: colors.textMuted }}>EIN letter, certificate, or legal document</Text>
            </TouchableOpacity>

            <Button 
              label="Submit for Review" 
              variant="primary" 
              onPress={submitDocs} 
              style={{ marginTop: spacing.md }}
            />
            <View style={[styles.noteBox, { marginTop: spacing.sm }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12.5, flex: 1, lineHeight: 17 }}>
                A Safal Events admin reviews your documents before your organization can host events.
              </Text>
            </View>
          </Card>
          
          <Button
            label="Log out"
            variant="danger"
            icon="log-out-outline"
            style={{ marginBottom: spacing.xl, marginTop: spacing.lg }}
            onPress={() => { auth.signOut(); navigation.replace('Auth'); }}
          />
        </View>
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHover,
  },
  noteBox: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: spacing.sm, 
    borderRadius: radius.md, 
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)'
  },
});
