import { useState, useEffect, useRef } from 'react'
import { ScrollView, View, TouchableOpacity, TextInput, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useCreateFocus, useFocus } from '../../src/hooks'
import { Bg, T, Btn } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'

const PRESETS = [
  { label: '25m', mins: 25 },
  { label: '45m', mins: 45 },
  { label: '60m', mins: 60 },
  { label: '90m', mins: 90 },
]

function pad(n: number) { return n.toString().padStart(2, '0') }
function fmt(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}` }

export default function Focus() {
  const insets = useSafeAreaInsets()
  const [preset, setPreset] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [note, setNote] = useState('')
  const startedAt = useRef('')
  const createFocus = useCreateFocus()
  const today = new Date().toISOString().split('T')[0]
  const { data: sessions = [] } = useFocus(today)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining(r => r > 0 ? r - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [running])

  // Detect completion
  useEffect(() => {
    if (remaining > 0 || !running) return
    setRunning(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    createFocus.mutate({
      duration_minutes: preset,
      task_note: note.trim() || undefined,
      started_at: startedAt.current,
      ended_at: new Date().toISOString(),
    }, { onSuccess: () => Alert.alert('LOCKED IN', `${preset} mins done. absolute unit.`) })
  }, [remaining, running]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    if (!startedAt.current) startedAt.current = new Date().toISOString()
    setRunning(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }

  const handlePause = () => {
    setRunning(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleReset = () => {
    setRunning(false)
    setRemaining(preset * 60)
    startedAt.current = ''
  }

  const pick = (mins: number) => {
    if (running) return
    setPreset(mins)
    setRemaining(mins * 60)
    startedAt.current = ''
  }

  const pct = 1 - remaining / (preset * 60)
  const isStarted = startedAt.current !== ''
  const totalMins = sessions.reduce((a, s) => a + s.duration_minutes, 0)

  return (
    <Bg>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: S.xl, paddingTop: insets.top + S.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: S.xl }}>
          <T s="xxs" c={C.textMuted} up ls={0.18}>NO DISTRACTIONS</T>
          <T s="xl" w="b" up ls={0.08}>LOCK IN</T>
        </View>

        {/* Duration presets */}
        <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.xl }}>
          {PRESETS.map(p => (
            <TouchableOpacity key={p.mins} activeOpacity={0.7} disabled={running}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); pick(p.mins) }}
              style={{ flex: 1, borderWidth: 1, paddingVertical: S.md, alignItems: 'center',
                borderColor: preset === p.mins ? C.border : C.borderLight,
                backgroundColor: preset === p.mins ? C.primary : 'transparent' }}>
              <T s="xs" up ls={0.06} c={preset === p.mins ? C.primaryFg : C.textMuted}>{p.label}</T>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer */}
        <View style={{ alignItems: 'center', marginBottom: S.xl }}>
          <View style={{ width: 180, height: 180, borderWidth: 2,
            borderColor: running ? C.border : C.borderLight,
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${Math.round(pct * 100)}%` as any, backgroundColor: C.primary, opacity: 0.07 }} />
            <T s="xxl" w="b" ls={0.02}>{fmt(remaining)}</T>
            <T s="xxs" c={running ? C.primary : C.textMuted} up ls={0.14}>
              {running ? 'LOCKED TF IN' : isStarted ? 'PAUSED' : 'READY'}
            </T>
          </View>
        </View>

        {/* Note input (hidden while running) */}
        {!running && (
          <TextInput
            placeholder="what r u grindin on..."
            placeholderTextColor={C.textMuted}
            value={note}
            onChangeText={setNote}
            style={{ borderWidth: 1, borderColor: C.borderLight, paddingVertical: S.md,
              paddingHorizontal: S.md, fontFamily: F.r, fontSize: FS.sm, color: C.text, marginBottom: S.xl }}
          />
        )}

        {/* Controls */}
        <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.xl }}>
          {running
            ? <Btn label="PAUSE" onPress={handlePause} outline style={{ flex: 1 }} />
            : <Btn label={isStarted ? 'RESUME' : 'LOCK IN'} onPress={handleStart} style={{ flex: 1 }} />
          }
          <Btn label="RESET" onPress={handleReset} outline style={{ flex: 1 }} />
        </View>

        {/* Today's sessions */}
        {sessions.length > 0 && (
          <>
            <T s="xxs" c={C.textMuted} up ls={0.18} style={{ marginBottom: S.sm }}>
              TODAY'S GRIND — {totalMins} MINS TOTAL
            </T>
            {sessions.map(s => (
              <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                borderWidth: 1, borderColor: C.borderLight, padding: S.md, marginBottom: S.xs }}>
                <T s="sm" c={C.textSub} style={{ flex: 1 }}>{s.task_note || 'deep focus'}</T>
                <T s="sm" w="b">{s.duration_minutes}m</T>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Bg>
  )
}
