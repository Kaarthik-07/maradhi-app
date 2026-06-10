import { useState } from 'react'
import { ScrollView, View, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../src/store/auth'
import { Bg, T, Inp, Btn } from '../../src/components/ui'
import { C, S, F, FS } from '../../src/constants/theme'

function MaradhiLogo() {
  return (
    <View style={{ alignItems: 'center', marginBottom: 36 }}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: 140, height: 140, marginBottom: S.md }}
        resizeMode="contain"
      />
      <T s="lg" w="b" up ls={0.24}>MARADHI</T>
      <T s="xxs" c={C.textMuted} ls={0.08} style={{ marginTop: 4 }}>for the chronically forgetful</T>
    </View>
  )
}

export default function Login() {
  const router = useRouter(), login = useAuthStore(s => s.login)
  const [user, setUser]       = useState('')
  const [pass, setPass]       = useState('')
  const [err, setErr]         = useState('')
  const [busy, setBusy]       = useState(false)
  const [showPass, setShowPass] = useState(false)

  const go = async () => {
    if (!user.trim() || !pass.trim()) { setErr('Username and password required'); return }
    setBusy(true); setErr('')
    try { await login({ username: user.trim(), password: pass }); router.replace('/(app)') }
    catch (e: any) { setErr(e?.message ?? 'Login failed') }
    finally { setBusy(false) }
  }

  return (
    <Bg>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: S.xl }} keyboardShouldPersistTaps="handled">
          <MaradhiLogo />
          <Inp label="Username" value={user} onChangeText={setUser} placeholder="your username"
            autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
          {/* Password with eye toggle */}
          <View style={{ marginBottom: S.md }}>
            <T s="xs" c={C.textMuted} up ls={0.12} style={{ marginBottom: S.xs }}>Password</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.borderLight, backgroundColor: 'rgba(255,255,255,0.7)' }}>
              <TextInput
                value={pass} onChangeText={setPass} placeholder="••••••••"
                placeholderTextColor={C.textMuted} secureTextEntry={!showPass}
                returnKeyType="done" onSubmitEditing={go}
                style={{ flex: 1, paddingVertical: S.md, paddingHorizontal: S.md, fontFamily: F.r, fontSize: FS.md, color: C.text }}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ paddingHorizontal: S.md }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          {!!err && <T s="xs" c={C.danger} style={{ marginBottom: S.md }}>{err}</T>}
          <Btn label="SIGN IN" onPress={go} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Bg>
  )
}
