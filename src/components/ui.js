import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Switch as RNSwitch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../theme/theme';

// Full-screen container with optional scrolling.
export function Screen({ children, scroll = true, style, contentStyle, edges = ['top'] }) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[{ padding: spacing.lg, paddingBottom: 40 }, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: spacing.lg }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {body}
    </SafeAreaView>
  );
}

export function Card({ children, style, onPress, padded = true }) {
  const inner = (
    <View style={[styles.card, padded && { padding: spacing.lg }, style]}>{children}</View>
  );
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const TONES = {
  green: { bg: colors.accentTint, fg: colors.accent },
  amber: { bg: colors.amberTint, fg: colors.amber },
  red: { bg: colors.redTint, fg: colors.red },
  primary: { bg: colors.primaryTint, fg: colors.primary },
  purple: { bg: colors.purpleTint, fg: colors.purple },
  blue: { bg: colors.blueTint, fg: colors.blue },
  gray: { bg: colors.surfaceHover, fg: colors.textMuted },
};

export function Badge({ label, tone = 'gray', dot = false, style }) {
  const t = TONES[tone] || TONES.gray;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      <Text style={{ color: t.fg, fontSize: 11, fontWeight: '700' }}>
        {dot ? '● ' : ''}
        {label}
      </Text>
    </View>
  );
}

export function Button({ label, onPress, variant = 'primary', icon, style, disabled, small }) {
  const variants = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    accent: { bg: colors.accent, fg: '#fff', border: colors.accent },
    danger: { bg: colors.redTint, fg: colors.red, border: 'transparent' },
    outline: { bg: 'transparent', fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        small && { paddingVertical: 8, paddingHorizontal: 12 },
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 15 : 17} color={v.fg} style={{ marginRight: 6 }} /> : null}
      <Text style={{ color: v.fg, fontWeight: '700', fontSize: small ? 13 : 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={styles.rowBetween}>
      <Text style={[font.h3, { marginBottom: spacing.sm }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Avatar({ seed, size = 40, style }) {
  return (
    <Image
      source={{ uri: avatarUrl(seed) }}
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceHover }, style]}
    />
  );
}

export function StatCard({ label, value, icon, color = colors.primary, style }) {
  return (
    <View style={[styles.card, { flex: 1, padding: spacing.lg }, style]}>
      <View style={[styles.iconTile, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 8 }}>{value}</Text>
      <Text style={font.small}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }, style]} />;
}

export function ListItemIcon({ name, color = colors.primary }) {
  return <Ionicons name={name} size={14} color={color} style={{ marginRight: 6 }} />;
}

export function Field({ label, value, placeholder, multiline, keyboardType }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={[font.small, { fontWeight: '700', marginBottom: 4, color: colors.text }]}>{label}</Text> : null}
      <TextInput
        defaultValue={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && { height: 90, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

export function ToggleRow({ label, desc, value, icon }) {
  const [on, setOn] = React.useState(!!value);
  return (
    <View style={[styles.rowBetween, styles.toggleRow]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Row>
          {icon ? <ListItemIcon name={icon} /> : null}
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{label}</Text>
        </Row>
        {desc ? <Text style={[font.tiny, { marginTop: 2 }]}>{desc}</Text> : null}
      </View>
      <RNSwitch
        value={on}
        onValueChange={setOn}
        trackColor={{ true: colors.primary, false: '#cbd5e1' }}
        thumbColor="#fff"
      />
    </View>
  );
}

// Simple in-screen segmented tab control.
export function Tabs({ tabs, active, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap}>
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.key;
        const label = typeof t === 'string' ? t : t.label;
        const isActive = active === key;
        return (
          <TouchableOpacity key={key} onPress={() => onChange(key)} style={styles.tabBtn}>
            <Text style={{ color: isActive ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 13 }}>
              {label}
            </Text>
            <View style={{ height: 2, marginTop: 6, backgroundColor: isActive ? colors.primary : 'transparent', borderRadius: 2 }} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function EmptyState({ icon = 'sparkles-outline', title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl }}>
      <View style={[styles.iconTile, { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryTint }]}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={[font.h3, { marginTop: 12 }]}>{title}</Text>
      {subtitle ? <Text style={[font.small, { textAlign: 'center', marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
  );
}

// Page header used inside stack screens that aren't tab roots.
export function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.header}>
      <Row>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={font.h2}>{title}</Text>
          {subtitle ? <Text style={font.small}>{subtitle}</Text> : null}
        </View>
        {right}
      </Row>
    </View>
  );
}

// Approval-state badge helper shared across host & guest screens.
export function ApprovalBadge({ rsvp }) {
  if (rsvp.status === 'waitlist' && rsvp.approvalState !== 'REJECTED')
    return <Badge tone="amber" dot label="Waitlisted · Under Approval" />;
  if (rsvp.approvalState === 'UNDER_APPROVAL') return <Badge tone="amber" dot label="Under Approval" />;
  if (rsvp.approvalState === 'REJECTED') return <Badge tone="red" dot label="Not Approved" />;
  if (rsvp.status === 'going') return <Badge tone="green" dot label="Confirmed" />;
  return <Badge tone="primary" dot label="Awaiting RSVP" />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconTile: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  toggleRow: {
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  tabsWrap: { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.lg, flexGrow: 0 },
  tabBtn: { marginRight: 18, paddingBottom: 2 },
  header: { marginBottom: spacing.lg },
});

export { styles as uiStyles };
