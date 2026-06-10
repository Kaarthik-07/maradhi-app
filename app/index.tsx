import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/store/auth'
export default function Gate() {
  const { isLoggedIn, loadToken } = useAuthStore()
  const [ready, setReady] = useState(false)
  useEffect(() => { loadToken().finally(() => setReady(true)) }, [])
  if (!ready) return <View style={{flex:1,backgroundColor:'#f4f3f0',alignItems:'center',justifyContent:'center'}}><ActivityIndicator color="#111111" size="large"/></View>
  return <Redirect href={isLoggedIn ? '/(app)' : '/(auth)/login'} />
}

