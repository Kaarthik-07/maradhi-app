import { useState } from 'react'
import { ScrollView, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Bg, T, Inp, Btn } from '../../src/components/ui'
import { C, S } from '../../src/constants/theme'
import { authApi } from '../../src/api'

export default function AddUser() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState('')

  const submit = async () => {
    if (!username.trim() || !password.trim()) { setErr('Username and password required'); return }
    if (password.length < 6) { setErr('Password needs to be at least 6 chars'); return }
    setBusy(true); setErr('')
    try {
      await authApi.register({ username: username.trim(), password, email: email.trim() || undefined })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setCreated(username.trim())
      setUsername(''); setPassword(''); setEmail('')
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create user')
    } finally {
      setBusy(false) }
  }

  return (
    <Bg>
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingTop: insets.top + S.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xl }}>
          <View>
            <T s="xxs" c={C.textMuted} up ls={0.18}>ADMIN ONLY</T>
            <T s="xl" w="b" up ls={0.08}>ADD USER</T>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <T s="lg" c={C.textMuted} w="b">×</T>
          </TouchableOpacity>
        </View>

        {created !== '' && (
          <View style={{ borderWidth: 1, borderColor: C.done, padding: S.md, marginBottom: S.lg }}>
            <T s="sm" c={C.done} up ls={0.08}>CREATED: {created}</T>
            <T s="xxs" c={C.textMuted} style={{ marginTop: 4 }}>They can now log in with their credentials</T>
          </View>
        )}

        <Inp label="Username" value={username} onChangeText={setUsername}
          placeholder="their handle" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
        <Inp label="Email (optional)" value={email} onChangeText={setEmail}
          placeholder="email@example.com" autoCapitalize="none" keyboardType="email-address" returnKeyType="next" />
        <Inp label="Password" value={password} onChangeText={setPassword}
          placeholder="min 6 characters" secureTextEntry returnKeyType="done" onSubmitEditing={submit} />

        {!!err && <T s="xs" c={C.danger} style={{ marginBottom: S.md }}>{err}</T>}
        <Btn label="CREATE USER" onPress={submit} loading={busy} />
        <T s="xxs" c={C.textMuted} style={{ marginTop: S.md, textAlign: 'center' }}>
          Requires ADMIN_SECRET to be set in app environment
        </T>
      </ScrollView>
    </Bg>
  )
}
