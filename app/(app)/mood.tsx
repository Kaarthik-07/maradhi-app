import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useMood, useCreateMood } from '../../src/hooks'
import { Bg, T, Btn, Empty } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'
import type { Mood } from '../../src/types'

const MOODS: { key: Mood; label: string; color: string; sub: string }[] = [
  { key: 'great', label: 'GREAT', color: '#3d9970', sub: 'absolutely slayin' },
  { key: 'good',  label: 'GOOD',  color: C.low,    sub: 'vibing fr' },
  { key: 'okay',  label: 'OKAY',  color: C.mid,    sub: 'mid but valid' },
  { key: 'low',   label: 'LOW',   color: C.high,   sub: 'it happens bestie' },
]

export default function MoodScreen() {
  const insets = useSafeAreaInsets()
  const [pick, setPick] = useState<Mood | null>(null)
  const [note, setNote] = useState('')
  const { data: logs = [], refetch } = useMood(14)
  const create = useCreateMood()

  const save = () => {
    if (!pick) return
    create.mutate(
      { mood: pick, note: note.trim() || undefined, logged_at: new Date().toISOString() },
      { onSuccess: () => { setPick(null); setNote(''); refetch() } }
    )
  }

  const moodColor = (m: Mood) => MOODS.find(x => x.key === m)?.color ?? C.textMuted

  return (
    <Bg>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: S.xl, paddingTop: insets.top + S.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: S.xl }}>
          <T s="xxs" c={C.textMuted} up ls={0.18}>HOW U FEELING RN</T>
          <T s="xl" w="b" up ls={0.08}>VIBES CHECK</T>
        </View>

        {/* Mood picker */}
        <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.lg }}>
          {MOODS.map(m => (
            <TouchableOpacity key={m.key} activeOpacity={0.7}
              onPress={() => { setPick(m.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
              style={{ flex: 1, borderWidth: pick === m.key ? 2 : 1,
                borderColor: pick === m.key ? m.color : C.borderLight,
                paddingVertical: S.lg, alignItems: 'center', gap: S.sm,
                backgroundColor: pick === m.key ? `${m.color}15` : 'transparent' }}>
              <View style={{ width: 8, height: 8, backgroundColor: m.color }} />
              <T s="xxs" up ls={0.1} c={pick === m.key ? m.color : C.textMuted}>{m.label}</T>
            </TouchableOpacity>
          ))}
        </View>

        {pick !== null && (
          <T s="xs" c={C.textMuted} style={{ marginBottom: S.md, textAlign: 'center' }}>
            {MOODS.find(m => m.key === pick)?.sub}
          </T>
        )}

        <TextInput
          placeholder="spill the tea... (optional)"
          placeholderTextColor={C.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          style={{ borderWidth: 1, borderColor: C.borderLight, paddingVertical: S.md, paddingHorizontal: S.md,
            fontFamily: F.r, fontSize: FS.sm, color: C.text, marginBottom: S.md, minHeight: 72, textAlignVertical: 'top' }}
        />

        <Btn label="LOG IT" onPress={save} disabled={!pick} loading={create.isPending} style={{ marginBottom: S.xxl }} />

        <T s="xxs" c={C.textMuted} up ls={0.18} style={{ marginBottom: S.sm }}>RECENT VIBES</T>
        {logs.length === 0 ? (
          <Empty msg="no vibes logged yet" />
        ) : (
          logs.slice(0, 10).map(l => (
            <View key={l.id} style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.borderLight, marginBottom: S.xs, overflow: 'hidden' }}>
              <View style={{ width: 3, backgroundColor: moodColor(l.mood) }} />
              <View style={{ flex: 1, padding: S.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <T s="sm" up ls={0.08}>{l.mood}</T>
                  {l.note ? <T s="xxs" c={C.textMuted} style={{ marginTop: 2 }}>{l.note.length > 40 ? l.note.slice(0, 40) + '…' : l.note}</T> : null}
                </View>
                <T s="xxs" c={C.textMuted}>
                  {new Date(l.logged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </T>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Bg>
  )
}
