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

// Brand lockup: emblem + "SafalEvents" wordmark (gold + navy) + subheading.
// onLight=true → dark text for light backgrounds; false → white text for the
// orange/dark splash. tile=true wraps the emblem in a white rounded card.
export function BrandLockup({ size = 38, onLight = true, subtitle = true, tile = false, align = 'left' }) {
  const safalColor = onLight ? '#1F3A63' : '#FFFFFF';
  const eventsColor = onLight ? '#C28C32' : '#FFFFFF';
  const subColor = onLight ? colors.textMuted : 'rgba(255,255,255,0.9)';
  const mark = (
    <Image source={require('../../assets/logo-mark.png')} style={{ width: size, height: size, resizeMode: 'contain' }} />
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
      {tile ? (
        <View style={{ backgroundColor: '#fff', borderRadius: Math.round(size * 0.28), padding: Math.round(size * 0.14) }}>{mark}</View>
      ) : mark}
      <View style={{ marginLeft: 10 }}>
        <Text style={{ fontSize: Math.round(size * 0.52), fontWeight: '800', letterSpacing: -0.3 }}>
          <Text style={{ color: safalColor }}>Safal</Text>
          <Text style={{ color: eventsColor }}>Events</Text>
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: Math.max(8, Math.round(size * 0.23)), fontWeight: '700', letterSpacing: 1.3, color: subColor, textTransform: 'uppercase', marginTop: 2 }}>
            Creating Successful Moments
          </Text>
        ) : null}
      </View>
    </View>
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

export function ToggleRow({ label, desc, value, icon, onChange }) {
  const [on, setOn] = React.useState(!!value);
  const handle = (v) => { setOn(v); onChange && onChange(v); };
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
        onValueChange={handle}
        trackColor={{ true: colors.primary, false: '#cbd5e1' }}
        thumbColor="#fff"
      />
    </View>
  );
}

// Simple in-screen segmented tab control.
export function Tabs({ tabs, active, onChange }) {
  return (
    <View style={styles.tabsWrap}>
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
    </View>
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

// ─── Controlled inputs (for forms/wizards that need to read values) ──────────
// The plain `Field` above is uncontrolled (defaultValue); use TextField when the
// screen must capture what the user types.
export function TextField({ label, value, onChangeText, placeholder, multiline, keyboardType, half }) {
  return (
    <View style={{ marginBottom: spacing.md, flex: half ? 1 : undefined }}>
      {label ? <Text style={[font.small, { fontWeight: '700', marginBottom: 4, color: colors.text }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && { height: 90, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

// Controlled on/off row (mirrors ToggleRow visuals but reports state to parent).
export function Toggle({ label, desc, value, onValueChange, icon }) {
  return (
    <View style={[styles.rowBetween, styles.toggleRow]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Row>
          {icon ? <ListItemIcon name={icon} /> : null}
          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{label}</Text>
        </Row>
        {desc ? <Text style={[font.tiny, { marginTop: 2 }]}>{desc}</Text> : null}
      </View>
      <RNSwitch value={!!value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: '#cbd5e1' }} thumbColor="#fff" />
    </View>
  );
}

// Selectable pill chips (single-select). options: array of strings or {key,label}.
export function Chips({ options, value, onChange, multi = false }) {
  const sel = multi ? (Array.isArray(value) ? value : []) : value;
  const isOn = (k) => (multi ? sel.includes(k) : sel === k);
  return (
    <View style={styles.chipsWrap}>
      {options.map((o) => {
        const key = typeof o === 'string' ? o : o.key;
        const label = typeof o === 'string' ? o : o.label;
        const on = isOn(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(multi ? (on ? sel.filter((x) => x !== key) : [...sel, key]) : key)}
            style={[styles.chip, on && styles.chipActive]}
            activeOpacity={0.85}
          >
            <Text style={{ color: on ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12.5 }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Step indicator dots for a multi-step wizard.
export function StepIndicator({ steps, current }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: 'center', width: 64 }}>
              <View style={[styles.stepDot, (active || done) && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {done ? (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                ) : (
                  <Text style={{ color: active ? '#fff' : colors.textMuted, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
                )}
              </View>
              <Text numberOfLines={1} style={{ fontSize: 9.5, marginTop: 4, fontWeight: '700', color: active ? colors.primary : colors.textMuted }}>
                {label}
              </Text>
            </View>
            {i < steps.length - 1 ? <View style={{ flex: 1, height: 2, backgroundColor: done ? colors.primary : colors.border, marginBottom: 14 }} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// Full-screen lock shown when an org host isn't verified yet (Phase 1 gating).
export function VerificationGate({ onUpload, title = 'Verification required', message }) {
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
        <View style={[styles.iconTile, { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.amberTint }]}>
          <Ionicons name="lock-closed" size={32} color={colors.amber} />
        </View>
        <Text style={[font.h2, { marginTop: 16, textAlign: 'center' }]}>{title}</Text>
        <Text style={[font.small, { textAlign: 'center', marginTop: 8, lineHeight: 19, paddingHorizontal: 8 }]}>
          {message || 'Upload your organization documents and get approved by Safal Events to start hosting.'}
        </Text>
        {onUpload ? (
          <Button label="Go to verification" icon="cloud-upload-outline" onPress={onUpload} style={{ marginTop: 20 }} />
        ) : null}
      </View>
    </Screen>
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 48,
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
  tabsWrap: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4, columnGap: 4, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.lg },
  tabBtn: { marginRight: 14, paddingBottom: 6 },
  header: { marginBottom: spacing.lg },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});

export { styles as uiStyles };
