import { useState, useMemo } from 'react'
import { ScrollView, View, TouchableOpacity, RefreshControl, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useTasks, useCompleteTask } from '../../src/hooks'
import { TaskRow } from '../../src/components/TaskRow'
import { Bg, T, Empty } from '../../src/components/ui'
import { C, S } from '../../src/constants/theme'
import type { Task } from '../../src/types'

const DAYS  = ['M','T','W','T','F','S','S']
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
const FILTERS = ['ALL','PENDING','DONE','OVERDUE'] as const
type Filter = typeof FILTERS[number]

const { width: SCREEN_W } = Dimensions.get('window')
const CELL_SIZE = Math.floor((SCREEN_W - S.xl * 2) / 7)

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function getDotColor(tasks: Task[], todayStr: string): string | null {
  if (!tasks.length) return null
  const pending = tasks.filter(t => t.status !== 'done')
  const overdue  = pending.filter(t => t.due_date && t.due_date.split('T')[0] < todayStr)
  if (overdue.length > 0)   return C.high   // red   — overdue
  if (pending.length === 0)  return C.done   // green — all done
  if (pending.length <= 2)   return C.low    // blue  — few pending
  return C.mid                               // orange — many pending
}

export default function Calendar() {
  const insets = useSafeAreaInsets()
  const router  = useRouter()
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const todayStr = now.toISOString().split('T')[0]
  const [selected, setSelected] = useState(todayStr)
  const [filter, setFilter] = useState<Filter>('ALL')
  const { complete } = useCompleteTask()
  const { data: tasks = [], refetch, isRefetching } = useTasks()

  const byDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach(t => {
      if (!t.due_date) return
      const d = t.due_date.split('T')[0]
      ;(map[d] ??= []).push(t)
    })
    return map
  }, [tasks])

  // Build calendar grid — Monday-first, rows of 7
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // 0=Mon
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const flat: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (flat.length % 7 !== 0) flat.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < flat.length; i += 7) rows.push(flat.slice(i, i + 7))

  const prev = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const next = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const selTasks = byDate[selected] ?? []
  const filteredTasks = selTasks.filter(t => {
    if (filter === 'ALL')     return true
    if (filter === 'PENDING') return t.status === 'pending'
    if (filter === 'DONE')    return t.status === 'done'
    if (filter === 'OVERDUE') return t.status !== 'done' && !!t.due_date && t.due_date.split('T')[0] < todayStr
    return true
  })
  const selDay = selected.split('-')[2]

  return (
    <Bg>
      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: insets.top + S.lg, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
          <T s="xl" w="b" up ls={0.08}>CALENDAR</T>
          <View style={{ flexDirection: 'row', gap: S.xl }}>
            <TouchableOpacity onPress={prev}><T s="lg" w="b">&lt;</T></TouchableOpacity>
            <TouchableOpacity onPress={next}><T s="lg" w="b">&gt;</T></TouchableOpacity>
          </View>
        </View>
        <T s="xs" c={C.textMuted} up ls={0.18} style={{ marginBottom: S.md }}>{MONTHS[month]} {year}</T>

        {/* Legend */}
        <View style={{ flexDirection: 'row', gap: S.md, marginBottom: S.md, flexWrap: 'wrap' }}>
          {([['overdue', C.high], ['many tasks', C.mid], ['few tasks', C.low], ['all done', C.done]] as const).map(([label, color]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, backgroundColor: color }} />
              <T s="xxs" c={C.textMuted} ls={0.04}>{label}</T>
            </View>
          ))}
        </View>

        {/* Day headers */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          {DAYS.map((d, i) => (
            <View key={i} style={{ width: CELL_SIZE, alignItems: 'center' }}>
              <T s="xxs" c={C.textMuted} up ls={0.02}>{d}</T>
            </View>
          ))}
        </View>

        {/* Calendar grid — row-based so Sunday never wraps */}
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row' }}>
            {row.map((d, ci) => {
              if (!d) return <View key={ci} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
              const ds      = toDateStr(year, month, d)
              const isToday = ds === todayStr
              const isSel   = ds === selected
              const dot     = getDotColor(byDate[ds] ?? [], todayStr)
              return (
                <TouchableOpacity key={ci} activeOpacity={0.7}
                  style={{ width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => { setSelected(ds); setFilter('ALL'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}>
                  <View style={{
                    width: 30, height: 30, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSel ? C.primary : 'transparent',
                    borderWidth: isToday && !isSel ? 1.5 : 0,
                    borderColor: C.danger,
                  }}>
                    <T s="xs" c={isSel ? C.primaryFg : isToday ? C.danger : C.text}>{d}</T>
                  </View>
                  {dot && !isSel && <View style={{ width: 5, height: 5, backgroundColor: dot, marginTop: 1 }} />}
                </TouchableOpacity>
              )
            })}
          </View>
        ))}

        {/* Selected date header + new task button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: S.xl, marginBottom: S.sm }}>
          <T s="xxs" c={C.textMuted} up ls={0.18}>TASKS ON {MONTHS[month].slice(0, 3)} {selDay}</T>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: '/(app)/tasks/new', params: { date: selected } } as any) }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: S.xs, borderWidth: 1, borderColor: C.border, paddingHorizontal: S.sm, paddingVertical: 3 }}>
            <T s="xxs" w="b" c={C.text}>+</T>
            <T s="xxs" up ls={0.06} c={C.text}>NEW TASK</T>
          </TouchableOpacity>
        </View>

        {/* Task status tabs */}
        <View style={{ flexDirection: 'row', gap: S.xs, marginBottom: S.md }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.7}
              style={{ flex: 1, borderWidth: 1, paddingVertical: 4, alignItems: 'center',
                borderColor: filter === f ? C.border : C.borderLight,
                backgroundColor: filter === f ? C.primary : 'transparent' }}>
              <T s="xxs" up ls={0.04} c={filter === f ? C.primaryFg : C.textMuted}>{f}</T>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTasks.length === 0
          ? <Empty msg={selTasks.length === 0 ? 'no tasks this day — add one' : `no ${filter.toLowerCase()} tasks`} />
          : filteredTasks.map(t => (
            <TaskRow key={t.id} task={t} onComplete={(id, done) => complete(id, done)} />
          ))
        }
      </ScrollView>
    </Bg>
  )
}
