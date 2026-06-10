import { ScrollView, View, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTasks, useHabits, useNotes, useBucket } from '../../src/hooks'
import { useAuthStore } from '../../src/store/auth'
import { Bg, T, Stat } from '../../src/components/ui'
import { C, S } from '../../src/constants/theme'
const Row=({label,value,onPress}:{label:string;value?:string;onPress?:()=>void})=>(
  <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}
    style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:S.md,borderBottomWidth:1,borderBottomColor:C.borderLight}}>
    <T s="xs" c={C.textSub} up ls={0.09}>{label}</T>
    {value?<T s="xs">{value}</T>:<T s="md" c={C.textMuted}>›</T>}
  </TouchableOpacity>
)
export default function Profile() {
  const router=useRouter(),insets=useSafeAreaInsets()
  const user=useAuthStore(s=>s.user),logout=useAuthStore(s=>s.logout)
  const {data:tasks=[]}=useTasks(),{data:habits=[]}=useHabits(),{data:notes=[]}=useNotes(),{data:bucket=[]}=useBucket()
  const done=tasks.filter(t=>t.status==='done').length,rate=tasks.length?Math.round((done/tasks.length)*100):0
  const handleLogout=()=>Alert.alert('Sign out?','',[{text:'Cancel',style:'cancel'},{text:'Sign out',style:'destructive',onPress:async()=>{Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);await logout();router.replace('/(auth)/login')}}])
  return (
    <Bg>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:S.xl,paddingTop:insets.top+S.lg,paddingBottom:40}} showsVerticalScrollIndicator={false}>
        <View style={{alignItems:'center',marginBottom:S.xl}}>
          <View style={{width:56,height:56,borderRadius:28,backgroundColor:C.primary,alignItems:'center',justifyContent:'center',marginBottom:S.sm}}>
            <T s="lg" w="b" c={C.primaryFg} up>{(user?.username??'AA').slice(0,2).toUpperCase()}</T>
          </View>
          <T s="lg" w="b" up ls={0.08}>{user?.username?.toUpperCase()??''}</T>
          {user?.email&&<T s="xs" c={C.textMuted} style={{marginTop:4}}>{user.email}</T>}
        </View>
        <View style={{flexDirection:'row',gap:S.sm,marginBottom:S.sm}}><Stat val={tasks.length} label="Tasks"/><Stat val={done} label="Done"/><Stat val={`${rate}%`} label="Rate"/></View>
        <View style={{flexDirection:'row',gap:S.sm,marginBottom:S.xl}}><Stat val={habits.length} label="Habits"/><Stat val={notes.length} label="Notes"/><Stat val={bucket.length} label="Bucket"/></View>
        <Row label="Username" value={user?.username}/>
        <Row label="Role" value={user?.is_admin?'Admin':'User'}/>
        {user?.is_admin&&<Row label="Add User" onPress={()=>router.push('/(app)/add-user' as any)}/>}
        <Row label="Sign out" onPress={handleLogout}/>
      </ScrollView>
    </Bg>
  )
}

