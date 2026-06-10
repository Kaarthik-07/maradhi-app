import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useTasks, useCompleteTask, useDeleteTask } from '../../../src/hooks'
import { Bg, T, Empty } from '../../../src/components/ui'
import { TaskRow } from '../../../src/components/TaskRow'
import { C, S, F, FS } from '../../../src/constants/theme'

const STATUS = ['All','Today','Overdue','Done']
const PRI = ['Any','High','Medium','Low']

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress() }} activeOpacity={0.7}
      style={{ borderWidth: 1, paddingHorizontal: S.sm, paddingVertical: 3,
        borderColor: active ? C.border : C.borderLight,
        backgroundColor: active ? C.primary : 'transparent' }}>
      <T s="xxs" up ls={0.06} c={active ? C.primaryFg : C.textMuted}>{label}</T>
    </TouchableOpacity>
  )
}

export default function Tasks() {
  const router = useRouter(), insets = useSafeAreaInsets()
  const [status, setStatus] = useState('All'), [pri, setPri] = useState('Any'), [search, setSearch] = useState('')
  const { complete } = useCompleteTask(), del = useDeleteTask()
  const filter = {
    due: status === 'Today' ? 'today' as const : status === 'Overdue' ? 'overdue' as const : undefined,
    status: status === 'Done' ? 'done' as const : undefined,
    priority: pri !== 'Any' ? pri.toLowerCase() as any : undefined,
  }
  const { data: tasks = [], refetch, isRefetching } = useTasks(filter)
  const filtered = search ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) : tasks

  return (
    <Bg>
      <View style={{ paddingTop: insets.top + S.lg, paddingHorizontal: S.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
          <T s="xl" w="b" up ls={0.08}>ALL TASKS</T>
          <TouchableOpacity onPress={() => router.push('/(app)/tasks/new')}
            style={{ width: 32, height: 32, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <T s="lg" w="b" c={C.primaryFg}>+</T>
          </TouchableOpacity>
        </View>
        {/* Search */}
        <TextInput placeholder="search tasks..." placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch}
          style={{ borderWidth: 1, borderColor: C.borderLight, paddingVertical: S.xs, paddingHorizontal: S.md,
            fontFamily: F.r, fontSize: FS.xs, color: C.text, marginBottom: S.xs }} />
        {/* Compact filter row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: S.xs, paddingVertical: S.xs, alignItems: 'center' }}>
          {STATUS.map(s => <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />)}
          <View style={{ width: 1, height: 14, backgroundColor: C.borderLight, marginHorizontal: S.xs }} />
          {PRI.map(p => <Chip key={p} label={p} active={pri === p} onPress={() => setPri(p)} />)}
        </ScrollView>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}>
        {filtered.length === 0
          ? <Empty msg="No tasks found" />
          : filtered.map(t => <TaskRow key={t.id} task={t} onComplete={(id, d) => complete(id, d)} onDelete={id => del.mutate(id)} />)
        }
      </ScrollView>
    </Bg>
  )
}
