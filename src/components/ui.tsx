import React, { memo } from 'react'
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    StyleSheet, ScrollView, useWindowDimensions
} from 'react-native'
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg'
import type { ViewStyle, TextStyle, TextInputProps } from 'react-native'
import { C, F, S, FS } from '../constants/theme'
import type { Priority } from '../types'

// Dot grid — single SVG with a Pattern fill (vs 1000+ individual Views)
const DotGrid = memo(function DotGrid() {
    const { width, height } = useWindowDimensions()
    return (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
                <Pattern id="dots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                    <Circle cx="9" cy="9" r="1" fill={C.dot} />
                </Pattern>
            </Defs>
            <Rect width={width} height={height} fill="url(#dots)" />
        </Svg>
    )
})

export function Bg({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
    return (
        <View style={[{ flex: 1, backgroundColor: C.bg }, style]}>
            <DotGrid />
            <View style={{ flex: 1 }}>{children}</View>
        </View>
    )
}

export function T({ children, style, s = 'md', w = 'r', c = C.text, up = false, ls = 0.04 }: {
    children: React.ReactNode; style?: TextStyle; s?: keyof typeof FS
    w?: 'r' | 'm' | 'b'; c?: string; up?: boolean; ls?: number
}) {
    return (
        <Text style={[
            {
                fontFamily: w === 'b' ? F.b : w === 'm' ? F.m : F.r,
                fontSize: FS[s], color: c, letterSpacing: ls
            },
            up && { textTransform: 'uppercase' },
            style,
        ]}>
            {children}
        </Text>
    )
}

export function Btn({ label, onPress, outline = false, danger = false,
    loading = false, disabled = false, style }: {
        label: string; onPress: () => void; outline?: boolean; danger?: boolean
        loading?: boolean; disabled?: boolean; style?: ViewStyle
    }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.75}
            style={[{
                backgroundColor: danger ? C.danger : outline ? 'transparent' : C.primary,
                borderColor: danger ? C.danger : C.border,
                borderWidth: outline || danger ? 1 : 0,
                paddingVertical: S.md, alignItems: 'center', minHeight: 48,
                opacity: disabled ? 0.5 : 1,
            }, style]}>
            {loading
                ? <ActivityIndicator color={danger ? C.dangerFg : outline ? C.text : C.primaryFg} size="small" />
                : <T s="sm" w="m" c={danger ? C.dangerFg : outline ? C.text : C.primaryFg} up ls={0.12}>{label}</T>
            }
        </TouchableOpacity>
    )
}

export function Inp({ label, error, style, ...p }: TextInputProps & { label?: string; error?: string; style?: ViewStyle }) {
    return (
        <View style={[{ marginBottom: S.md }, style]}>
            {label && <T s="xs" c={C.textMuted} up ls={0.12} style={{ marginBottom: S.xs }}>{label}</T>}
            <TextInput
                placeholderTextColor={C.textMuted} selectionColor={C.primary} {...p}
                style={[{
                    borderWidth: 1, borderColor: error ? C.danger : C.border,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    paddingVertical: S.md, paddingHorizontal: S.md,
                    fontFamily: F.r, fontSize: FS.md, color: C.text,
                }, (p as any).style]}
            />
            {error && <T s="xs" c={C.danger} style={{ marginTop: 4 }}>{error}</T>}
        </View>
    )
}

export function Check({ checked, onPress }: { checked: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
                width: 18, height: 18, borderWidth: 1.5,
                borderColor: checked ? C.primary : C.border,
                backgroundColor: checked ? C.primary : 'transparent',
                alignItems: 'center', justifyContent: 'center',
            }}>
            {checked && <T s="xs" c={C.primaryFg}>✓</T>}
        </TouchableOpacity>
    )
}

export function PBar({ p }: { p: Priority }) {
    return <View style={{ width: 3, backgroundColor: p === 'high' ? C.high : p === 'medium' ? C.mid : C.low }} />
}

export function PBadge({ p }: { p: Priority }) {
    const bg = p === 'high' ? C.high : p === 'medium' ? C.mid : C.low
    return (
        <View style={{ backgroundColor: bg, paddingHorizontal: S.sm, paddingVertical: 3 }}>
            <T s="xs" c="#fff" up ls={0.1}>{p}</T>
        </View>
    )
}

export function Sec({ label }: { label: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginVertical: S.md }}>
            <T s="xs" c={C.textMuted} up ls={0.18}>{label}</T>
            <View style={{ flex: 1, height: 1, backgroundColor: C.borderLight }} />
        </View>
    )
}

export function Stat({ val, label, red }: { val: number | string; label: string; red?: boolean }) {
    return (
        <View style={{ flex: 1, borderWidth: 1, borderColor: C.border, padding: S.md, alignItems: 'center' }}>
            <T s="xxl" w="b" c={red ? C.danger : C.text}>{val}</T>
            <T s="xs" c={C.textMuted} up ls={0.09}>{label}</T>
        </View>
    )
}

export function Empty({ msg }: { msg: string }) {
    return (
        <View style={{ paddingVertical: S.xxl, alignItems: 'center' }}>
            <T s="md" c={C.textMuted} up ls={0.1}>{msg}</T>
        </View>
    )
}

export function Loading() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={C.primary} size="large" />
        </View>
    )
}

export function Chips({ items, active, onPress }: {
    items: string[]; active: string; onPress: (v: string) => void
}) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: S.xl, gap: S.xs, paddingBottom: S.sm }}>
            {items.map(it => (
                <TouchableOpacity key={it} onPress={() => onPress(it)} activeOpacity={0.7}
                    style={{
                        borderWidth: 1, paddingHorizontal: S.md, paddingVertical: S.sm,
                        borderColor: active === it ? C.border : C.borderLight,
                        backgroundColor: active === it ? C.primary : 'transparent',
                    }}>
                    <T s="xs" up ls={0.08} c={active === it ? C.primaryFg : C.textMuted}>{it}</T>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}
