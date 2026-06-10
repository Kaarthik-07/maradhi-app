import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as Haptics from 'expo-haptics'
import { useCreateTask, useTags } from '../../../src/hooks'
import { Bg, T, Inp, Btn, Sec } from '../../../src/components/ui'
import { C, S } from '../../../src/constants/theme'
import type { Priority } from '../../../src/types'

const PRI: Priority[] = ['high', 'medium', 'low']
const PC = (p: Priority) => p === 'high' ? C.high : p === 'medium' ? C.mid : C.low

function fmt12(d: Date) {
  let h = d.getHours(), m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NewTask() {
  const router = useRouter()
  const { date: prefillDate } = useLocalSearchParams<{ date?: string }>()
  const create = useCreateTask()
  const { data: tags = [] } = useTags()

  const [title, setTitle]   = useState('')
  const [notes, setNotes]   = useState('')
  const [pri,   setPri]     = useState<Priority>('medium')
  const [tagIDs, setTagIDs] = useState<string[]>([])
  const [err,   setErr]     = useState('')

  // Date/time state
  const initDate = (() => {
    if (prefillDate) {
      const d = new Date(prefillDate + 'T09:00:00')
      return isNaN(d.getTime()) ? new Date() : d
    }
    const d = new Date(); d.setHours(9, 0, 0, 0); return d
  })()
  const [dueDate,   setDueDate]   = useState<Date | null>(prefillDate ? initDate : null)
  const [dueTime,   setDueTime]   = useState<Date>(initDate)
  const [showDate,  setShowDate]  = useState(false)
  const [showTime,  setShowTime]  = useState(false)
  const [hasTime,   setHasTime]   = useState(false)

  const getDueISO = () => {
    if (!dueDate) return undefined
    const combined = new Date(dueDate)
    if (hasTime) { combined.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0) }
    else { combined.setHours(9, 0, 0, 0) }
    return combined.toISOString()
  }

  const setQuick = (offset: number) => {
    const d = new Date(); d.setDate(d.getDate() + offset); d.setHours(9, 0, 0, 0)
    setDueDate(d); setHasTime(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const submit = async () => {
    if (!title.trim()) { setErr('Task name is required'); return }
    setErr('')
    try {
      await create.mutateAsync({ title: title.trim(), notes: notes.trim() || undefined, priority: pri, due_date: getDueISO(), tag_ids: tagIDs })
      router.back()
    } catch (e: any) { setErr(e?.message ?? 'Failed to create') }
  }

  const isToday = dueDate ? fmtDate(dueDate) === fmtDate(new Date()) : false
  const isTmrw  = dueDate ? fmtDate(dueDate) === fmtDate(new Date(Date.now() + 86400000)) : false

  return (
    <Bg>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={st.hdr}>
          <T s="lg" w="b" up ls={0.08}>NEW TASK</T>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <T s="xl" c={C.textMuted}>×</T>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Inp label="Task name" value={title} onChangeText={setTitle} placeholder="What needs to be done?" autoFocus error={err} />

          <Sec label="Priority" />
          <View style={st.row}>
            {PRI.map(p => (
              <TouchableOpacity key={p} activeOpacity={0.7}
                style={[st.btn, { borderColor: pri === p ? PC(p) : C.borderLight, backgroundColor: pri === p ? PC(p) + '18' : 'transparent' }]}
                onPress={() => { setPri(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}>
                <T s="xxs" up ls={0.09} c={pri === p ? PC(p) : C.textMuted} w={pri === p ? 'm' : 'r'}>{p}</T>
              </TouchableOpacity>
            ))}
          </View>

          <Sec label="Due date" />
          <View style={st.row}>
            <TouchableOpacity activeOpacity={0.7} style={[st.btn, { borderColor: isToday ? C.border : C.borderLight, backgroundColor: isToday ? '#e5e4de' : 'transparent' }]}
              onPress={() => setQuick(0)}>
              <T s="xxs" up ls={0.08} c={isToday ? C.text : C.textMuted}>Today</T>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={[st.btn, { borderColor: isTmrw ? C.border : C.borderLight, backgroundColor: isTmrw ? '#e5e4de' : 'transparent' }]}
              onPress={() => setQuick(1)}>
              <T s="xxs" up ls={0.08} c={isTmrw ? C.text : C.textMuted}>Tomorrow</T>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={[st.btn, { borderColor: C.borderLight, flex: 1.4 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDate(true) }}>
              <T s="xxs" up ls={0.06} c={dueDate && !isToday && !isTmrw ? C.text : C.textMuted}>
                {dueDate && !isToday && !isTmrw ? fmtDate(dueDate) : 'Pick date'}
              </T>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity activeOpacity={0.7} style={[st.btn, { borderColor: C.borderLight }]}
                onPress={() => setDueDate(null)}>
                <T s="xxs" c={C.textMuted}>Clear</T>
              </TouchableOpacity>
            )}
          </View>

          {/* Time row — only shown when a date is selected */}
          {dueDate && (
            <View style={[st.row, { marginTop: S.xs }]}>
              <TouchableOpacity activeOpacity={0.7}
                style={[st.btn, { flex: 1, borderColor: hasTime ? C.border : C.borderLight, backgroundColor: hasTime ? '#e5e4de' : 'transparent' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowTime(true); setHasTime(true) }}>
                <T s="xxs" up ls={0.08} c={hasTime ? C.text : C.textMuted}>
                  {hasTime ? fmt12(dueTime) : '+ Add time'}
                </T>
              </TouchableOpacity>
              {hasTime && (
                <TouchableOpacity activeOpacity={0.7} style={[st.btn, { borderColor: C.borderLight }]}
                  onPress={() => setHasTime(false)}>
                  <T s="xxs" c={C.textMuted}>No time</T>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Native date picker */}
          {showDate && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
              onChange={(_, d) => { setShowDate(Platform.OS === 'ios'); if (d) setDueDate(d) }}
            />
          )}

          {/* Native time picker */}
          {showTime && (
            <DateTimePicker
              value={dueTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, t) => { setShowTime(Platform.OS === 'ios'); if (t) setDueTime(t) }}
            />
          )}

          {tags.length > 0 && (
            <>
              <Sec label="Tags" />
              <View style={st.tagRow}>
                {tags.map(tag => {
                  const sel = tagIDs.includes(tag.id)
                  return (
                    <TouchableOpacity key={tag.id} activeOpacity={0.7}
                      style={{ borderWidth: 1, borderColor: C.borderLight, paddingHorizontal: S.sm, paddingVertical: S.xs, backgroundColor: sel ? C.primary : 'transparent' }}
                      onPress={() => setTagIDs(prev => sel ? prev.filter(i => i !== tag.id) : [...prev, tag.id])}>
                      <T s="xxs" up ls={0.08} c={sel ? C.primaryFg : C.textSub}>{tag.name}</T>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          )}

          <Inp label="Notes" value={notes} onChangeText={setNotes} placeholder="Add a note…" multiline numberOfLines={3} style={{ marginTop: S.sm }} />

          <View style={st.actions}>
            <Btn label="DRAFT" outline onPress={() => router.back()} style={{ flex: 1 }} />
            <Btn label="JUST DO IT" onPress={submit} loading={create.isPending} style={{ flex: 2 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Bg>
  )
}

const st = StyleSheet.create({
  hdr:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: S.xl, paddingTop: 56 },
  scroll: { padding: S.xl, paddingTop: 0, paddingBottom: 60 },
  row:    { flexDirection: 'row', gap: S.xs, marginBottom: S.sm },
  btn:    { flex: 1, borderWidth: 1, paddingVertical: S.sm, alignItems: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs, marginBottom: S.sm },
  actions:{ flexDirection: 'row', gap: S.sm, marginTop: S.md },
})
