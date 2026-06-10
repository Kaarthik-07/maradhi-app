import { useState, useEffect, useRef } from 'react'
import {
  View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useNote, useCreateNote, useUpdateNote, useDeleteNote } from '../../src/hooks'
import { Bg, T, Loading } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'

/* ─── constants ─────────────────────────────────────────────── */

const TAGS = ['work', 'ideas', 'personal', 'research', 'random'] as const
type Tag = typeof TAGS[number]

const TAG_COLORS: Record<string, string> = {
  work: C.primary, ideas: C.low, personal: C.mid, research: '#7c3aed', random: C.mid, draft: C.textMuted,
}

const TEMPLATES = [
  {
    label: 'BLANK',
    icon: '○',
    title: '',
    content: '',
    tag: 'personal' as Tag,
  },
  {
    label: 'MEETING',
    icon: '◈',
    title: `Meeting — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    content: 'Attendees:\n\nAgenda:\n\nAction items:\n\nNext steps:\n',
    tag: 'work' as Tag,
  },
  {
    label: 'BRAIN DUMP',
    icon: '◉',
    title: 'Brain dump',
    content: '',
    tag: 'ideas' as Tag,
  },
  {
    label: 'DAILY LOG',
    icon: '◇',
    title: `Log — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    content: 'What happened:\n\nWins:\n\nTomorrow:\n\nRandom thoughts:\n',
    tag: 'personal' as Tag,
  },
  {
    label: 'RESEARCH',
    icon: '◫',
    title: '',
    content: 'Source:\n\nKey points:\n\nQuotes:\n\nMy take:\n',
    tag: 'research' as Tag,
  },
]

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0
}
function charCount(s: string) { return s.length }

/* ─── component ─────────────────────────────────────────────── */

export default function NoteEditor() {
  const { id, template: templateParam } = useLocalSearchParams<{ id?: string; template?: string }>()
  const router   = useRouter()
  const insets   = useSafeAreaInsets()
  const isEdit   = !!id

  const { data: existing, isLoading } = useNote(id ?? '')
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [tag,     setTag]     = useState<Tag>('personal')
  const [isDraft, setIsDraft] = useState(false)
  const [picked,  setPicked]  = useState(false)   // template chosen
  const [saving,  setSaving]  = useState(false)
  const [dirty,   setDirty]   = useState(false)

  const contentRef = useRef<TextInput>(null)

  // Load existing note data
  useEffect(() => {
    if (existing && !dirty) {
      setTitle(existing.title)
      setContent(existing.content)
      setIsDraft(existing.tag_label === 'draft')
      setTag((TAGS.includes(existing.tag_label as Tag) ? existing.tag_label : 'personal') as Tag)
      setPicked(true)
    }
  }, [existing])

  // Apply template from param
  useEffect(() => {
    if (!isEdit && templateParam) {
      const t = TEMPLATES.find(t => t.label.toLowerCase() === templateParam.toLowerCase())
      if (t) { setTitle(t.title); setContent(t.content); setTag(t.tag); setPicked(true) }
    }
  }, [templateParam])

  const accent = TAG_COLORS[isDraft ? 'draft' : tag] ?? C.mid

  const words = wordCount(content)
  const chars = charCount(content)

  const save = async (asDraft: boolean) => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Even a short one — for the chronically forgetful.')
      return
    }
    setSaving(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const tagLabel = asDraft ? 'draft' : tag
    try {
      if (isEdit && id) {
        await updateNote.mutateAsync({ id, body: { title: title.trim(), content, tag_label: tagLabel } })
      } else {
        await createNote.mutateAsync({ title: title.trim(), content, tag_label: tagLabel })
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setDirty(false)
      router.back()
    } catch (e: any) {
      Alert.alert('Failed to save', e?.message ?? 'Try again')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!id) { router.back(); return }
    Alert.alert('Delete note?', title || 'This note', [
      { text: 'nah', style: 'cancel' },
      {
        text: 'yeet it', style: 'destructive', onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          deleteNote.mutate(id, { onSuccess: () => router.back() })
        },
      },
    ])
  }

  if (isEdit && isLoading) return <Bg><Loading /></Bg>

  // ── Template picker (new notes only, before content started) ──
  if (!isEdit && !picked) {
    return (
      <Bg>
        <View style={{ paddingTop: insets.top + S.lg, paddingHorizontal: S.xl, paddingBottom: S.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xl }}>
            <TouchableOpacity onPress={() => router.back()}>
              <T s="xs" c={C.textMuted} up ls={0.1}>← BACK</T>
            </TouchableOpacity>
          </View>
          <T s="xxs" c={C.textMuted} up ls={0.18}>START WITH</T>
          <T s="xl" w="b" up ls={0.08} style={{ marginBottom: S.xl }}>A TEMPLATE</T>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {TEMPLATES.map(t => (
            <TouchableOpacity key={t.label} activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setTitle(t.title); setContent(t.content); setTag(t.tag); setPicked(true)
              }}
              style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.borderLight, padding: S.lg, marginBottom: S.sm, gap: S.md }}>
              <T s="lg" w="b" c={TAG_COLORS[t.tag]}>{t.icon}</T>
              <View style={{ flex: 1 }}>
                <T s="sm" w="m" up ls={0.08}>{t.label}</T>
                {t.content ? (
                  <T s="xxs" c={C.textMuted} style={{ marginTop: 2 }}>{t.content.replace(/\n/g, ' · ').slice(0, 50)}…</T>
                ) : (
                  <T s="xxs" c={C.textMuted}>empty canvas — no rules fr</T>
                )}
              </View>
              <T s="md" c={C.textMuted}>›</T>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Bg>
    )
  }

  // ── Main editor ──────────────────────────────────────────────
  return (
    <Bg>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Accent bar ── */}
        <View style={{ height: 3, backgroundColor: accent }} />

        {/* ── Fixed header ── */}
        <View style={{ paddingTop: insets.top + S.sm, paddingHorizontal: S.xl, paddingBottom: S.sm, borderBottomWidth: 1, borderBottomColor: C.borderLight }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
            <TouchableOpacity onPress={() => {
              if (dirty) {
                Alert.alert('Discard changes?', '', [
                  { text: 'Keep editing', style: 'cancel' },
                  { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                ])
              } else router.back()
            }}>
              <T s="xs" c={C.textMuted} up ls={0.1}>← NOTES</T>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: S.md, alignItems: 'center' }}>
              {isDraft && (
                <View style={{ borderWidth: 1, borderColor: C.textMuted, paddingHorizontal: S.xs, paddingVertical: 1 }}>
                  <T s="xxs" c={C.textMuted} up ls={0.08}>DRAFT</T>
                </View>
              )}
              {isEdit && (
                <TouchableOpacity onPress={handleDelete}>
                  <T s="xs" c={C.danger} up ls={0.08}>DELETE</T>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tag selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: S.xs }}>
            {TAGS.map(t => (
              <TouchableOpacity key={t} activeOpacity={0.7}
                onPress={() => { setTag(t); setIsDraft(false); setDirty(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
                style={{ borderWidth: 1, paddingHorizontal: S.sm, paddingVertical: 2,
                  borderColor: tag === t && !isDraft ? accent : C.borderLight,
                  backgroundColor: tag === t && !isDraft ? accent : 'transparent' }}>
                <T s="xxs" up ls={0.08} c={tag === t && !isDraft ? '#fff' : C.textMuted}>{t}</T>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Sticky title input ── */}
        <View style={{ paddingHorizontal: S.xl, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.borderLight }}>
          <TextInput
            value={title}
            onChangeText={v => { setTitle(v); setDirty(true) }}
            placeholder="Title..."
            placeholderTextColor={C.textMuted}
            multiline
            returnKeyType="next"
            blurOnSubmit
            onSubmitEditing={() => contentRef.current?.focus()}
            style={{ fontFamily: F.b, fontSize: FS.xl, color: C.text, lineHeight: 28 }}
          />
        </View>

        {/* ── Scrollable content ── */}
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput
            ref={contentRef}
            value={content}
            onChangeText={v => { setContent(v); setDirty(true) }}
            placeholder="Start writing... no cap, just let it out"
            placeholderTextColor={C.textMuted}
            multiline
            textAlignVertical="top"
            style={{
              fontFamily: F.r, fontSize: FS.md, color: C.text, lineHeight: 24,
              padding: S.xl, minHeight: 320,
            }}
          />
        </ScrollView>

        {/* ── Fixed footer ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: S.sm,
          paddingHorizontal: S.xl, paddingVertical: S.md,
          paddingBottom: Math.max(insets.bottom, S.md),
          borderTopWidth: 1, borderTopColor: C.borderLight,
          backgroundColor: C.bg,
        }}>
          {/* Stats */}
          <View style={{ flex: 1 }}>
            <T s="xxs" c={C.textMuted} ls={0.04}>{words} {words === 1 ? 'word' : 'words'} · {chars} chars</T>
            {isEdit && existing && (
              <T s="xxs" c={C.textMuted} ls={0.04}>
                {new Date(existing.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </T>
            )}
          </View>

          {/* Draft button */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => save(true)} disabled={saving}
            style={{ borderWidth: 1, borderColor: C.borderLight, paddingHorizontal: S.md, paddingVertical: S.sm }}>
            {saving && isDraft
              ? <ActivityIndicator size="small" color={C.textMuted} />
              : <T s="xs" up ls={0.08} c={C.textMuted}>DRAFT</T>
            }
          </TouchableOpacity>

          {/* Publish/Save button */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => save(false)} disabled={saving}
            style={{ backgroundColor: C.primary, paddingHorizontal: S.lg, paddingVertical: S.sm }}>
            {saving && !isDraft
              ? <ActivityIndicator size="small" color={C.primaryFg} />
              : <T s="xs" up ls={0.08} c={C.primaryFg} w="m">{isEdit ? 'UPDATE' : 'PUBLISH'}</T>
            }
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </Bg>
  )
}
