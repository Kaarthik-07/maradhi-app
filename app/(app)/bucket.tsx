import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useBucket, useCreateBucket, useUpdateBucket, useDeleteBucket } from '../../src/hooks'
import { Bg, T, Empty, Check } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'

const CATS = ['All', 'Travel', 'Career', 'Health', 'Personal', 'Creative']
type Status = 'All' | 'Pending' | 'Done'

export default function Bucket() {
  const insets = useSafeAreaInsets()
  const [cat, setCat]             = useState('All')
  const [status, setStatus]       = useState<Status>('All')
  const [adding, setAdding]       = useState(false)
  const [title, setTitle]         = useState('')
  const [desc, setDesc]           = useState('')
  const [newCat, setNewCat]       = useState('personal')
  const { data: rawItems = [], refetch, isRefetching, isLoading } = useBucket(cat === 'All' ? undefined : cat.toLowerCase())
  const create = useCreateBucket()
  const update = useUpdateBucket()
  const del    = useDeleteBucket()

  const items = rawItems.filter(i =>
    status === 'All' ? true : status === 'Done' ? i.is_done : !i.is_done
  )

  const submit = () => {
    if (!title.trim()) return
    create.mutate(
      { title: title.trim(), description: desc.trim() || undefined, category: newCat },
      { onSuccess: () => { setTitle(''); setDesc(''); setAdding(false) } }
    )
  }

  const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => { onPress(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
      style={{ borderWidth: 1, paddingHorizontal: S.sm, paddingVertical: 3,
        borderColor: active ? C.border : C.borderLight,
        backgroundColor: active ? C.primary : 'transparent' }}>
      <T s="xxs" up ls={0.06} c={active ? C.primaryFg : C.textMuted}>{label}</T>
    </TouchableOpacity>
  )

  return (
    <Bg>
      <View style={{ paddingTop: insets.top + S.lg, paddingHorizontal: S.xl, paddingBottom: S.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md }}>
          <View>
            <T s="xxs" c={C.textMuted} up ls={0.18}>DREAM BIG BESTIE</T>
            <T s="xl" w="b" up ls={0.08}>BUCKET LIST</T>
          </View>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAdding(v => !v) }}
            style={{ width: 32, height: 32, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <T s="lg" w="b" c={C.primaryFg}>{adding ? '×' : '+'}</T>
          </TouchableOpacity>
        </View>

        {/* Compact combined filter row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: S.xs, paddingVertical: S.xs, alignItems: 'center' }}>
          {CATS.map(c => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}
          <View style={{ width: 1, height: 14, backgroundColor: C.borderLight, marginHorizontal: S.xs }} />
          {(['All', 'Pending', 'Done'] as Status[]).map(s => (
            <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </ScrollView>

        {adding && (
          <View style={{ borderWidth: 1, borderColor: C.border, padding: S.md, marginTop: S.sm, gap: S.sm }}>
            <TextInput placeholder="the dream..." placeholderTextColor={C.textMuted}
              value={title} onChangeText={setTitle} autoFocus
              style={{ borderWidth: 1, borderColor: C.borderLight, paddingVertical: S.sm, paddingHorizontal: S.md, fontFamily: F.r, fontSize: FS.sm, color: C.text }} />
            <TextInput placeholder="more deets (optional)" placeholderTextColor={C.textMuted}
              value={desc} onChangeText={setDesc}
              style={{ borderWidth: 1, borderColor: C.borderLight, paddingVertical: S.sm, paddingHorizontal: S.md, fontFamily: F.r, fontSize: FS.sm, color: C.text }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.xs }}>
              {CATS.filter(c => c !== 'All').map(c => (
                <TouchableOpacity key={c} onPress={() => setNewCat(c.toLowerCase())}
                  style={{ borderWidth: 1, paddingHorizontal: S.sm, paddingVertical: 3,
                    borderColor: newCat === c.toLowerCase() ? C.border : C.borderLight,
                    backgroundColor: newCat === c.toLowerCase() ? C.primary : 'transparent' }}>
                  <T s="xxs" up ls={0.08} c={newCat === c.toLowerCase() ? C.primaryFg : C.textMuted}>{c}</T>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={submit} disabled={create.isPending}
              style={{ backgroundColor: C.primary, paddingVertical: S.sm, alignItems: 'center' }}>
              <T s="sm" c={C.primaryFg} up ls={0.08} w="m">ADD TO BUCKET</T>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <T s="sm" c={C.textMuted} style={{ paddingVertical: S.xxl, textAlign: 'center' }}>loading...</T>
        ) : items.length === 0 ? (
          <Empty msg="no dreams yet — add one bestie" />
        ) : (
          items.map(item => (
            <TouchableOpacity key={item.id} activeOpacity={0.9}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                Alert.alert('Delete?', item.title, [
                  { text: 'nah', style: 'cancel' },
                  { text: 'yeet', style: 'destructive', onPress: () => del.mutate(item.id) },
                ])
              }}
              style={{ flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1,
                borderColor: C.borderLight, marginBottom: S.sm, padding: S.md, gap: S.md,
                opacity: item.is_done ? 0.55 : 1 }}>
              <Check checked={item.is_done} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                update.mutate({ id: item.id, body: { is_done: !item.is_done } })
              }} />
              <View style={{ flex: 1 }}>
                <T s="sm" style={{ textDecorationLine: item.is_done ? 'line-through' : 'none' }}>{item.title}</T>
                {item.description ? <T s="xxs" c={C.textMuted} style={{ marginTop: 2 }}>{item.description}</T> : null}
                <T s="xxs" c={C.textMuted} up ls={0.06} style={{ marginTop: S.xs }}>{item.category}</T>
              </View>
              {item.is_done && <T s="xxs" c="#3d9970" up ls={0.08}>DONE</T>}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Bg>
  )
}
