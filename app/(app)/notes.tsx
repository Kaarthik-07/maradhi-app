import { useState, useMemo } from 'react'
import { ScrollView, View, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useNotes, useDeleteNote } from '../../src/hooks'
import { Bg, T, Empty } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'

const TAG_FILTERS = ['All', 'Work', 'Ideas', 'Personal', 'Research', 'Random']
const TAG_COLORS: Record<string, string> = {
  work: C.primary, ideas: C.low, personal: C.mid,
  research: '#7c3aed', random: C.mid, draft: C.textMuted,
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function Notes() {
  const router = useRouter(), insets = useSafeAreaInsets()
  const [tagFilter, setTagFilter] = useState('All')
  const [search, setSearch] = useState('')
  const del = useDeleteNote()

  // Fetch all notes (we'll separate drafts client-side)
  const { data: allNotes = [], refetch, isRefetching } = useNotes(undefined, search || undefined)

  const { drafts, published } = useMemo(() => {
    const filtered = tagFilter === 'All'
      ? allNotes
      : allNotes.filter(n => n.tag_label === tagFilter.toLowerCase())
    return {
      drafts:    allNotes.filter(n => n.tag_label === 'draft'),
      published: filtered.filter(n => n.tag_label !== 'draft'),
    }
  }, [allNotes, tagFilter])

  const goToEditor = (id?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (id) router.push({ pathname: '/(app)/note-editor', params: { id } } as any)
    else router.push('/(app)/note-editor' as any)
  }

  const NoteCard = ({ n }: { n: typeof allNotes[0] }) => {
    const accent = TAG_COLORS[n.tag_label] ?? C.mid
    const isDraft = n.tag_label === 'draft'
    return (
      <TouchableOpacity activeOpacity={0.8}
        onPress={() => goToEditor(n.id)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          Alert.alert('Delete note?', n.title, [
            { text: 'nah', style: 'cancel' },
            { text: 'yeet it', style: 'destructive', onPress: () => del.mutate(n.id) },
          ])
        }}
        style={{ borderWidth: 1, borderColor: C.borderLight, marginBottom: S.sm, overflow: 'hidden', opacity: isDraft ? 0.7 : 1 }}>
        <View style={{ height: 3, backgroundColor: accent }} />
        <View style={{ padding: S.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.xs }}>
            <T s="sm" w="m" style={{ flex: 1 }}>{n.title || 'Untitled'}</T>
            <View style={{ flexDirection: 'row', gap: S.xs, marginLeft: S.sm, alignItems: 'center' }}>
              {isDraft && (
                <View style={{ borderWidth: 1, borderColor: C.textMuted, paddingHorizontal: 4, paddingVertical: 1 }}>
                  <T s="xxs" c={C.textMuted} up ls={0.06}>DRAFT</T>
                </View>
              )}
              {!isDraft && (
                <View style={{ backgroundColor: accent, paddingHorizontal: S.xs, paddingVertical: 1 }}>
                  <T s="xxs" c="#fff" up ls={0.06}>{n.tag_label}</T>
                </View>
              )}
            </View>
          </View>
          {n.content ? (
            <T s="xs" c={C.textSub} style={{ lineHeight: 16 }}>
              {n.content.replace(/\n/g, ' ').slice(0, 90)}{n.content.length > 90 ? '…' : ''}
            </T>
          ) : (
            <T s="xs" c={C.textMuted} style={{ lineHeight: 16 }}>no content yet</T>
          )}
          <T s="xxs" c={C.textMuted} style={{ marginTop: S.xs }}>{timeAgo(n.updated_at)}</T>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Bg>
      {/* Header */}
      <View style={{ paddingTop: insets.top + S.lg, paddingHorizontal: S.xl, paddingBottom: S.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
          <View>
            <T s="xxs" c={C.textMuted} up ls={0.18}>BRAIN STORAGE</T>
            <T s="xl" w="b" up ls={0.08}>NOTES</T>
          </View>
          <TouchableOpacity onPress={() => goToEditor()}
            style={{ width: 32, height: 32, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <T s="lg" w="b" c={C.primaryFg}>+</T>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput placeholder="search notes..." placeholderTextColor={C.textMuted}
          value={search} onChangeText={setSearch}
          style={{ borderWidth: 1, borderColor: C.borderLight, paddingVertical: S.xs, paddingHorizontal: S.md,
            fontFamily: F.r, fontSize: FS.xs, color: C.text, marginBottom: S.xs }} />

        {/* Tag filter row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: S.xs, paddingVertical: S.xs }}>
          {TAG_FILTERS.map(t => (
            <TouchableOpacity key={t} activeOpacity={0.7}
              onPress={() => { setTagFilter(t); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
              style={{ borderWidth: 1, paddingHorizontal: S.sm, paddingVertical: 3,
                borderColor: tagFilter === t ? C.border : C.borderLight,
                backgroundColor: tagFilter === t ? C.primary : 'transparent' }}>
              <T s="xxs" up ls={0.06} c={tagFilter === t ? C.primaryFg : C.textMuted}>{t}</T>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* Drafts section */}
        {drafts.length > 0 && tagFilter === 'All' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginVertical: S.md }}>
              <T s="xxs" c={C.textMuted} up ls={0.18}>DRAFTS</T>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.textMuted, alignItems: 'center', justifyContent: 'center' }}>
                <T s="xxs" c={C.bg}>{drafts.length}</T>
              </View>
              <View style={{ flex: 1, height: 1, backgroundColor: C.borderLight }} />
            </View>
            {drafts.map(n => <NoteCard key={n.id} n={n} />)}
          </>
        )}

        {/* Published notes section */}
        {(drafts.length > 0 && tagFilter === 'All') && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginVertical: S.md }}>
            <T s="xxs" c={C.textMuted} up ls={0.18}>PUBLISHED</T>
            <View style={{ flex: 1, height: 1, backgroundColor: C.borderLight }} />
          </View>
        )}

        {published.length === 0 && drafts.length === 0 ? (
          <View style={{ paddingTop: S.xxl, alignItems: 'center', gap: S.md }}>
            <T s="md" c={C.textMuted} up ls={0.1}>NOTHING YET</T>
            <T s="xs" c={C.textMuted} style={{ textAlign: 'center' }}>tap + to write your first note</T>
          </View>
        ) : published.length === 0 ? (
          <Empty msg="no published notes" />
        ) : (
          published.map(n => <NoteCard key={n.id} n={n} />)
        )}
      </ScrollView>
    </Bg>
  )
}
