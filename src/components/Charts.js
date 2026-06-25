// Lightweight, dependency-free charts built from plain Views — no SVG/canvas.
// Designed to look clean on a phone and read at a glance.
import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing, radius, font } from '../theme/theme';

// ─── Circular gauge (tick ring) ─────────────────────────────────────────────
// A ring of ticks; the first `progress`% light up. Center shows value + label.
export function GaugeRing({
  progress = 0,
  size = 132,
  color = colors.accent,
  track = colors.border,
  value,
  label,
  ticks = 40,
}) {
  const p = Math.max(0, Math.min(1, progress));
  const lit = Math.round(p * ticks);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: ticks }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            alignItems: 'center',
            transform: [{ rotate: `${(360 / ticks) * i}deg` }],
          }}
          pointerEvents="none"
        >
          <View
            style={{
              width: 3,
              height: 13,
              borderRadius: 2,
              marginTop: 3,
              backgroundColor: i < lit ? color : track,
            }}
          />
        </View>
      ))}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, fontFamily: 'Inter_800ExtraBold' }}>
          {value != null ? value : `${Math.round(p * 100)}%`}
        </Text>
        {label ? (
          <Text style={[font.tiny, { marginTop: 2, textAlign: 'center' }]}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Vertical grouped bar chart ─────────────────────────────────────────────
// data: [{ label, a, b }]. Two bars per group (a = primary, b = accent).
export function BarGroupChart({ data = [], height = 130, aColor = colors.primary, bColor = colors.accent }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.a || 0, d.b || 0)));
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 12 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: '100%' }}>
              <View
                style={{
                  width: 13,
                  height: `${Math.max(4, ((d.a || 0) / max) * 100)}%`,
                  backgroundColor: aColor,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              />
              <View
                style={{
                  width: 13,
                  height: `${Math.max(4, ((d.b || 0) / max) * 100)}%`,
                  backgroundColor: bColor,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
        {data.map((d, i) => (
          <Text key={i} numberOfLines={1} style={[font.tiny, { flex: 1, textAlign: 'center' }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── Horizontal bars with leading labels ────────────────────────────────────
// data: [{ label, value, color? }].
export function HBars({ data = [], trackColor = colors.surfaceHover, barColor = colors.primary, suffix = '' }) {
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  return (
    <View style={{ gap: 12 }}>
      {data.map((d, i) => (
        <View key={i}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={[font.small, { fontWeight: '700', color: colors.text }]} numberOfLines={1}>
              {d.label}
            </Text>
            <Text style={[font.small, { fontWeight: '700', color: colors.text }]}>
              {d.value}
              {suffix}
            </Text>
          </View>
          <View style={{ height: 9, backgroundColor: trackColor, borderRadius: radius.full, overflow: 'hidden' }}>
            <View
              style={{
                height: 9,
                width: `${((d.value || 0) / max) * 100}%`,
                backgroundColor: d.color || barColor,
                borderRadius: radius.full,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Stacked horizontal bar (single row) ────────────────────────────────────
// segments: [{ value, color, label }].
export function StackedBar({ segments = [], height = 12 }) {
  const total = Math.max(1, segments.reduce((n, s) => n + (s.value || 0), 0));
  return (
    <View>
      <View style={{ flexDirection: 'row', height, borderRadius: radius.full, overflow: 'hidden', backgroundColor: colors.surfaceHover }}>
        {segments.map((s, i) => (
          <View key={i} style={{ width: `${((s.value || 0) / total) * 100}%`, backgroundColor: s.color }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 14 }}>
        {segments.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: s.color, marginRight: 6 }} />
            <Text style={font.tiny}>
              {s.label} · {s.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Small chart legend ─────────────────────────────────────────────────────
export function Legend({ items = [] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: spacing.md }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: it.color, marginRight: 6 }} />
          <Text style={font.tiny}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}
