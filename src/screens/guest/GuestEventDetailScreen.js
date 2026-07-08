import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, Linking } from 'react-native';
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
} from '../../components/ui';
import { events, getEvent, getEventPhotos, uploadPhoto, useStore, myRsvps } from '../../data/mock';
import { useAuth, gateAction } from '../../auth/AuthContext';

export default function GuestEventDetailScreen({ navigation, route }) {
  const auth = useAuth();
  useStore(); // reflect new/approved album photos live
  const event = getEvent(route.params?.eventId) || events[0];
  const albumPhotos = event.enablePhotoAlbum ? getEventPhotos(event.id).filter((p) => p.status === 'APPROVED') : [];
  const canUploadPhotos = event.enablePhotoAlbum && event.photoUploadPermission === 'guests' && auth.isAuthed;

  return (
    <Screen contentStyle={{ padding: 0 }}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: event.cover }} style={styles.cover} />
        <View style={styles.coverOverlay} />
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.coverText}>
          <Row style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="primary" label={event.eventType === 'Other' ? (event.customEventType || 'Special Event') : event.eventType} />
            <Badge tone="blue" label={event.eventMode || 'Onsite'} />
            {event.ageRestricted ? <Badge tone="red" label={`🔒 ${event.minimumAge}+ Event`} /> : null}
          </Row>
          <Text style={[font.h1, { color: colors.white, marginTop: spacing.sm }]} numberOfLines={2}>{event.title}</Text>
        </View>
      </View>

      <View style={{ padding: spacing.lg }}>
        <Card style={{ marginBottom: spacing.lg }}>
          <Row style={{ marginBottom: spacing.sm }}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[font.body, { marginLeft: spacing.sm }]}>
              {event.date} • {event.time}
            </Text>
          </Row>
          <Row style={{ marginBottom: spacing.sm }}>
            <Ionicons
              name={
                event.eventMode === 'Virtual'
                  ? 'videocam-outline'
                  : event.eventMode === 'Hybrid'
                  ? 'globe-outline'
                  : 'location-outline'
              }
              size={18}
              color={colors.primary}
            />
            <Text style={[font.body, { marginLeft: spacing.sm, flex: 1 }]} numberOfLines={2}>
              {event.eventMode === 'Virtual'
                ? 'Virtual Event'
                : event.eventMode === 'Hybrid'
                ? `Hybrid • ${event.venueName || event.location}`
                : event.venueName || event.location}
            </Text>
          </Row>
          <Row style={{ marginBottom: spacing.sm }}>
            <Ionicons name="people-outline" size={18} color={colors.primary} />
            <Text style={[font.body, { marginLeft: spacing.sm }]}>
              Capacity {event.capacity}
            </Text>
          </Row>
          <Divider />
          <Row>
            <Avatar seed={event.hostName} size={36} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={[font.body, { fontWeight: '700' }]} numberOfLines={1}>{event.hostName}</Text>
              <Text style={font.small}>Host</Text>
            </View>
          </Row>
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[font.body, { lineHeight: 21 }]}>{event.description}</Text>
        </Card>

        {/* Onsite / Hybrid Venue Details */}
        {(event.eventMode === 'Onsite' || event.eventMode === 'Hybrid') && event.venueName ? (
          <>
            <SectionTitle>Venue Details</SectionTitle>
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={[font.h3, { marginBottom: spacing.xs }]}>{event.venueName}</Text>
              <Text style={[font.body, { color: colors.text }]}>{event.venueAddressLine1}</Text>
              {event.venueAddressLine2 ? <Text style={[font.body, { color: colors.text }]}>{event.venueAddressLine2}</Text> : null}
              <Text style={[font.body, { color: colors.textMuted }]}>
                {event.venueCity}, {event.venueState} {event.venuePostalCode}
              </Text>
              <Text style={[font.body, { color: colors.textMuted, marginBottom: spacing.md }]}>
                {event.venueCountry}
              </Text>

              {event.venueInstructions ? (
                <View style={{ marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary + '08' }}>
                  <Text style={[font.tiny, { fontWeight: '700', color: colors.textMuted, marginBottom: 2 }]}>ADDITIONAL VENUE INFORMATION</Text>
                  <Text style={font.small}>{event.venueInstructions}</Text>
                </View>
              ) : null}

              {event.venueMapLink ? (
                <Button
                  label="View on Map"
                  variant="outline"
                  icon="map-outline"
                  onPress={() => {
                    Linking.openURL(event.venueMapLink).catch(() =>
                      Alert.alert('Error', 'Could not open map link.')
                    );
                  }}
                />
              ) : null}
            </Card>
          </>
        ) : null}

        {/* Virtual / Hybrid Meeting Details (with access control) */}
        {(event.eventMode === 'Virtual' || event.eventMode === 'Hybrid') && (
          <>
            <SectionTitle>Meeting Details</SectionTitle>
            {(() => {
              const myRsvp = myRsvps.find((r) => r.eventId === event.id);
              const isConfirmed = myRsvp && myRsvp.status === 'going' && myRsvp.approvalState === 'APPROVED';

              if (!isConfirmed) {
                return (
                  <Card style={{ marginBottom: spacing.lg, borderColor: colors.amber, backgroundColor: colors.amber + '0a' }}>
                    <Row style={{ alignItems: 'flex-start' }}>
                      <Ionicons name="lock-closed-outline" size={18} color={colors.amber} style={{ marginTop: 2 }} />
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={[font.body, { fontWeight: '700', color: colors.text }]}>Meeting Details Locked</Text>
                        <Text style={[font.small, { color: colors.textMuted, marginTop: 4, lineHeight: 17 }]}>
                          The virtual meeting credentials will be unlocked once your RSVP is approved and confirmed.
                        </Text>
                      </View>
                    </Row>
                  </Card>
                );
              }

              return (
                <Card style={{ marginBottom: spacing.lg }}>
                  <Row style={{ marginBottom: spacing.md, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge tone="green" label={`Platform: ${event.meetingPlatform || 'Zoom'}`} />
                    <Ionicons name="videocam-outline" size={20} color={colors.accent} />
                  </Row>

                  <Button
                    label="Join Meeting"
                    variant="primary"
                    icon="log-in-outline"
                    style={{ marginBottom: spacing.md }}
                    onPress={() => {
                      Linking.openURL(event.meetingLink).catch(() =>
                        Alert.alert('Error', 'Could not open meeting link.')
                      );
                    }}
                  />

                  {event.meetingId ? (
                    <Row style={{ justifyContent: 'space-between', marginBottom: spacing.xs }}>
                      <Text style={font.small}>Meeting ID</Text>
                      <Text style={[font.body, { fontWeight: '700' }]}>{event.meetingId}</Text>
                    </Row>
                  ) : null}

                  {event.meetingPasscode ? (
                    <Row style={{ justifyContent: 'space-between', marginBottom: spacing.sm }}>
                      <Text style={font.small}>Passcode</Text>
                      <Text style={[font.body, { fontWeight: '700', color: colors.primary }]}>{event.meetingPasscode}</Text>
                    </Row>
                  ) : null}

                  {event.meetingInstructions ? (
                    <View style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary + '08' }}>
                      <Text style={[font.tiny, { fontWeight: '700', color: colors.textMuted, marginBottom: 2 }]}>JOINING INSTRUCTIONS</Text>
                      <Text style={font.small}>{event.meetingInstructions}</Text>
                    </View>
                  ) : null}
                </Card>
              );
            })()}
          </>
        )}


        {event.dressCode && event.dressCode !== 'No Dress Code' ? (
          <>
            <SectionTitle>Dress Code</SectionTitle>
            <Card style={{ marginBottom: spacing.lg }}>
              <Row style={{ gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'center' }}>
                <Ionicons name="shirt-outline" size={18} color={colors.primary} />
                <Badge tone="accent" label={event.dressCode === 'Other' ? (event.customDressCode || 'Custom attire') : event.dressCode} />
              </Row>
              
              {event.dressCodeDescription ? (
                <Text style={[font.body, { marginBottom: spacing.sm, lineHeight: 18 }]}>
                  {event.dressCodeDescription}
                </Text>
              ) : null}

              {event.dressCodeAvoid ? (
                <Row style={{ marginBottom: spacing.sm, alignItems: 'flex-start' }}>
                  <Ionicons name="close-circle" size={16} color={colors.red} style={{ marginTop: 2 }} />
                  <Text style={[font.small, { marginLeft: spacing.xs, color: colors.red, fontWeight: '600', flex: 1 }]}>
                    Avoid: {event.dressCodeAvoid}
                  </Text>
                </Row>
              ) : null}

              {event.dressCodeInstructions ? (
                <Row style={{ alignItems: 'flex-start' }}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[font.small, { marginLeft: spacing.xs, color: colors.text, flex: 1 }]}>
                    {event.dressCodeInstructions}
                  </Text>
                </Row>
              ) : null}

              {event.dressCodeCover ? (
                <View style={{ marginTop: spacing.md, borderRadius: radius.md, overflow: 'hidden' }}>
                  <Text style={[font.tiny, { fontWeight: '700', marginBottom: spacing.xs, color: colors.textMuted }]}>OUTFIT INSPIRATION</Text>
                  <Image source={{ uri: event.dressCodeCover }} style={{ width: '100%', height: 160, borderRadius: radius.md }} />
                </View>
              ) : null}
            </Card>
          </>
        ) : null}

        {event.questions?.length > 0 ? (
          <>
            <SectionTitle>What the host asks</SectionTitle>
            <Card style={{ marginBottom: spacing.lg }}>
              {event.questions.map((q, idx) => (
                <Row key={idx} style={{ marginBottom: idx < event.questions.length - 1 ? spacing.sm : 0 }}>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  <Text style={[font.body, { marginLeft: spacing.sm, flex: 1 }]}>{q}</Text>
                </Row>
              ))}
            </Card>
          </>
        ) : null}

        {event.enablePhotoAlbum ? (
          <>
            <SectionTitle
              right={canUploadPhotos ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => uploadPhoto(event.id, { uploader: 'Alice Vance', role: 'guest' })}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>+ Add photos</Text>
                </TouchableOpacity>
              ) : null}
            >
              Photo album
            </SectionTitle>
            <Card style={{ marginBottom: spacing.lg }}>
              {albumPhotos.length === 0 ? (
                <Text style={font.small}>No photos yet — check back around the event.</Text>
              ) : (
                <View style={styles.photoGrid}>
                  {albumPhotos.map((p) => (
                    <View key={p.id} style={styles.photoCell}>
                      <Image source={{ uri: p.url }} style={styles.photoImg} />
                    </View>
                  ))}
                </View>
              )}
              {event.photoUploadPermission === 'guests' && event.requirePhotoApproval ? (
                <Text style={[font.tiny, { marginTop: spacing.sm, lineHeight: 16 }]}>Guest uploads are reviewed by the host before they appear.</Text>
              ) : event.photoUploadPermission !== 'guests' ? (
                <Text style={[font.tiny, { marginTop: spacing.sm, lineHeight: 16 }]}>Only the host can add photos to this album.</Text>
              ) : !auth.isAuthed ? (
                <Text style={[font.tiny, { marginTop: spacing.sm, lineHeight: 16 }]}>RSVP to add your own photos.</Text>
              ) : null}
            </Card>
          </>
        ) : null}

        <Card style={{ marginBottom: spacing.lg, borderColor: colors.primary }}>
          <Text style={font.h2}>
            {event.approvalRequired ? 'Request your spot' : 'Reserve your spot'}
          </Text>
          <Text style={[font.small, { marginTop: spacing.xs, lineHeight: 17 }]}>
            {event.approvalRequired
              ? 'This event requires organizer approval.'
              : 'RSVP now — capacity is limited.'}
          </Text>

          {event.ageRestricted ? (
            <Row style={{ marginTop: spacing.sm }}>
              <Ionicons name="lock-closed" size={16} color={colors.red} />
              <Text style={[font.small, { marginLeft: spacing.xs, color: colors.red, fontWeight: '700', flex: 1 }]}>
                {event.minimumAge}+ only · age verified at RSVP
              </Text>
            </Row>
          ) : null}

          {event.enablePayments ? (
            <Row style={{ marginTop: spacing.md }}>
              <Ionicons name="ticket-outline" size={18} color={colors.primary} />
              <Text style={[font.h3, { marginLeft: spacing.sm }]}>
                Ticket: ${event.ticketPrice}
              </Text>
            </Row>
          ) : null}

          <Button
            label={event.approvalRequired ? 'Request to Join' : 'RSVP Now'}
            variant="primary"
            style={{ marginTop: spacing.lg }}
            onPress={() => gateAction(auth, navigation, { nav: 'GuestRsvp', params: { eventId: event.id }, role: 'guest' })}
          />

          {event.messagingEnabled ? (
            <Button
              label="Message Host"
              variant="outline"
              icon="chatbubbles-outline"
              style={{ marginTop: spacing.sm }}
              onPress={() => gateAction(auth, navigation, { nav: 'GuestChat', params: { eventId: event.id } })}
            />
          ) : null}

          {!auth.isAuthed ? (
            <Text style={[font.tiny, { textAlign: 'center', marginTop: spacing.sm, lineHeight: 16 }]}>
              You're browsing as a guest — we'll ask you to sign in when you RSVP.
            </Text>
          ) : null}
        </Card>
      </View>
    </Screen>
  );
}

export { GuestEventDetailScreen };

const styles = StyleSheet.create({
  coverWrap: { width: '100%', height: 210, backgroundColor: colors.surfaceHover },
  cover: { width: '100%', height: '100%' },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  photoCell: { width: '33.33%', aspectRatio: 1, padding: 4 },
  photoImg: { width: '100%', height: '100%', borderRadius: radius.sm, backgroundColor: colors.surfaceHover },
});
