import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useHabits, useCreateHabit, useDeleteHabit, useLogHabit } from '../../src/hooks'
import { Bg, T, Empty } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'

const DAY_LABELS = ['M','T','W','T','F','S','S']
const TODAY = new Date().toISOString().split('T')[0]

function getWeekDates(): string[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function Habits() {
  const insets = useSafeAreaInsets()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const { data: habits = [], refetch, isRefetching, isLoading } = useHabits()
  const create = useCreateHabit()
  const del = useDeleteHabit()
  const log = useLogHabit()
  const week = getWeekDates()

  const submit = () => {
    if (!name.trim()) return
    create.mutate(name.trim(), { onSuccess: () => { setName(''); setAdding(false) } })
  }

  return (
    <Bg>
      <View style={{ paddingTop: insets.top + S.lg, paddingHorizontal: S.xl, paddingBottom: S.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md }}>
          <View>
            <T s="xxs" c={C.textMuted} up ls={0.18}>GRIND SZNNNN</T>
            <T s="xl" w="b" up ls={0.08}>HABITS</T>
          </View>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAdding(v => !v) }}
            style={{ width: 32, height: 32, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <T s="lg" w="b" c={C.primaryFg}>{adding ? '×' : '+'}</T>
          </TouchableOpacity>
        </View>

        {adding && (
          <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.md }}>
            <TextInput
              placeholder="new habit fr fr..."
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={setName}
              onSubmitEditing={submit}
              autoFocus
              returnKeyType="done"
              style={{ flex: 1, borderWidth: 1, borderColor: C.border, paddingVertical: S.sm, paddingHorizontal: S.md, fontFamily: F.r, fontSize: FS.sm, color: C.text }}
            />
            <TouchableOpacity onPress={submit} disabled={create.isPending}
              style={{ backgroundColor: C.primary, paddingHorizontal: S.md, justifyContent: 'center' }}>
              <T s="sm" c={C.primaryFg} up ls={0.08}>ADD</T>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 2, gap: 3 }}>
          {DAY_LABELS.map((d, i) => (
            <View key={i} style={{ width: 26, alignItems: 'center' }}>
              <T s="xxs" c={week[i] === TODAY ? C.text : C.textMuted} w={week[i] === TODAY ? 'b' : 'r'} ls={0.02}>{d}</T>
            </View>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <T s="sm" c={C.textMuted} up ls={0.1}>loading...</T>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
          showsVerticalScrollIndicator={false}>
          {habits.length === 0 ? (
            <Empty msg="no habits yet — gotta start somewhere" />
          ) : (
            habits.map(h => {
              const logged: string[] = h.week_logs ?? []
              const doneThisWeek = week.filter(d => logged.includes(d) && d <= TODAY).length
              return (
                <TouchableOpacity key={h.id} activeOpacity={0.9}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                    Alert.alert('Delete habit?', h.name, [
                      { text: 'nah', style: 'cancel' },
                      { text: 'yeet it', style: 'destructive', onPress: () => del.mutate(h.id) },
                    ])
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.borderLight, marginBottom: S.sm, padding: S.md, gap: S.sm }}>
                  <View style={{ flex: 1 }}>
                    <T s="sm" w="m">{h.name}</T>
                    <T s="xxs" c={doneThisWeek >= 5 ? C.mid : doneThisWeek > 0 ? C.textSub : C.textMuted} ls={0.04}>
                      {doneThisWeek >= 5 ? `${doneThisWeek}x this week — bussin` : doneThisWeek > 0 ? `${doneThisWeek}x this week` : 'start the grind'}
                    </T>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {week.map(date => {
                      const done = logged.includes(date)
                      const isToday = date === TODAY
                      const future = date > TODAY
                      return (
                        <TouchableOpacity key={date} disabled={future} activeOpacity={0.7}
                          onPress={() => {
                            Haptics.impactAsync(done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium)
                            log.mutate({ id: h.id, body: { date, done: !done } })
                          }}
                          style={{
                            width: 26, height: 26, borderWidth: 1,
                            borderColor: done ? C.mid : isToday ? C.border : C.borderLight,
                            backgroundColor: done ? C.mid : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                            opacity: future ? 0.25 : 1,
                          }}>
                          {done && <T s="xxs" c="#fff" ls={0}>✓</T>}
                          {!done && isToday && <View style={{ width: 4, height: 4, backgroundColor: C.border }} />}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      )}
    </Bg>
  )
}
