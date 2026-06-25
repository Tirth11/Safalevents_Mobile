import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, Row, ScreenHeader } from '../../components/ui';
import { useStore, integrations, toggleIntegration } from '../../data/mock';

export default function IntegrationsScreen({ navigation }) {
  useStore();

  const connected = integrations.filter((it) => it.connected).length;
  const total = integrations.length;

  return (
    <Screen>
      <ScreenHeader
        title="Integrations"
        subtitle="Connect your favorite tools"
        onBack={() => navigation.goBack()}
      />

      <Text style={[font.small, { marginBottom: spacing.md }]}>
        {connected} of {total} connected
      </Text>

      {integrations.map((it) => (
        <Card key={it.id} style={{ marginBottom: spacing.md }}>
          <Row>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: it.color + '22',
              }}
            >
              <Ionicons name={it.icon} size={22} color={it.color} />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md, paddingRight: spacing.sm }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text, fontFamily: 'Inter_700Bold' }}>
                {it.name}
              </Text>
              <Text style={[font.small, { marginTop: 2 }]}>{it.desc}</Text>
            </View>
          </Row>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: spacing.md }}>
            {it.connected ? (
              <>
                <Badge tone="green" dot label="Connected" style={{ marginRight: spacing.sm }} />
                <Button
                  label="Disconnect"
                  variant="outline"
                  small
                  onPress={() => toggleIntegration(it.id)}
                />
              </>
            ) : (
              <Button
                label="Connect"
                variant="primary"
                small
                onPress={() => toggleIntegration(it.id)}
              />
            )}
          </View>
        </Card>
      ))}

      <Text style={[font.tiny, { textAlign: 'center', marginTop: spacing.md }]}>
        More integrations coming soon.
      </Text>
    </Screen>
  );
}
