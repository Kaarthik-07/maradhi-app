import { View, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useNote, useDeleteNote } from '../../src/hooks'
import { Bg, T, Loading } from '../../src/components/ui'
import { C, S } from '../../src/constants/theme'

const TAG_COLORS: Record<string, string> = {
  work: C.primary, ideas: C.low, personal: C.mid, research: C.low, random: C.mid,
}

export default function NoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: note, isLoading } = useNote(id)
  const del = useDeleteNote()

  const handleDelete = () => {
    Alert.alert('Delete note?', note?.title, [
      { text: 'nah', style: 'cancel' },
      {
        text: 'yeet it', style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          del.mutate(id, { onSuccess: () => router.back() })
        },
      },
    ])
  }

  if (isLoading) return <Bg><Loading /></Bg>
  if (!note) return <Bg><T s="sm" c={C.textMuted} style={{ padding: S.xl }}>Note not found.</T></Bg>

  const accent = TAG_COLORS[note.tag_label] ?? C.mid

  return (
    <Bg>
      <View style={{ height: 3, backgroundColor: accent }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: S.xl, paddingTop: insets.top + S.md, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>
        {/* Back + delete row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xl }}>
          <TouchableOpacity onPress={() => router.back()}>
            <T s="xs" c={C.textMuted} up ls={0.1}>← NOTES</T>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <T s="xs" c={C.danger} up ls={0.1}>DELETE</T>
          </TouchableOpacity>
        </View>

        {/* Tag badge */}
        <View style={{ backgroundColor: accent, paddingHorizontal: S.sm, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: S.md }}>
          <T s="xxs" c="#fff" up ls={0.1}>{note.tag_label}</T>
        </View>

        {/* Title */}
        <T s="xl" w="b" ls={0.04} style={{ marginBottom: S.sm }}>{note.title}</T>
        <T s="xxs" c={C.textMuted} style={{ marginBottom: S.xl }}>
          {new Date(note.updated_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </T>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: C.borderLight, marginBottom: S.xl }} />

        {/* Content */}
        <T s="md" c={C.text} style={{ lineHeight: 26 }}>{note.content}</T>
      </ScrollView>
    </Bg>
  )
}
