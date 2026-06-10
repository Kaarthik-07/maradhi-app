import { ScrollView, View, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTasks, useCompleteTask } from '../../src/hooks'
import { useAuthStore } from '../../src/store/auth'
import { Bg, T, Stat, Sec } from '../../src/components/ui'
import { TaskRow } from '../../src/components/TaskRow'
import { C, S } from '../../src/constants/theme'
const ACTIONS=[
  {label:'New Task',route:'/(app)/tasks/new',dark:true},
  {label:'Today',route:'/(app)/today',dark:false},
  {label:'Bucket List',route:'/(app)/more',dark:false},
  {label:'Overdue',route:'/(app)/today',dark:false},
  {label:'Habits',route:'/(app)/more',dark:false},
  {label:'Focus',route:'/(app)/more',dark:false},
]
export default function Home() {
  const router=useRouter(),insets=useSafeAreaInsets(),user=useAuthStore(s=>s.user)
  const {complete}=useCompleteTask()
  const {data:tasks=[],refetch,isRefetching}=useTasks()
  const done=tasks.filter(t=>t.status==='done').length
  const overdue=tasks.filter(t=>t.due_date&&t.status!=='done'&&new Date(t.due_date)<new Date()).length
  const upNext=tasks.filter(t=>t.status==='pending').slice(0,3)
  const pct=tasks.length?Math.round((done/tasks.length)*100):0
  const greeting=()=>{const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'}
  return (
    <Bg>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:S.xl,paddingTop:insets.top+S.lg,paddingBottom:40}}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary}/>}
        showsVerticalScrollIndicator={false}>
        <View style={{marginBottom:S.lg}}>
          <T s="xxs" c={C.textMuted} up ls={0.18}>{greeting()}</T>
          <T s="xxl" w="b" up ls={0.08} style={{marginTop:4}}>{(user?.username??'MARADHI').toUpperCase()}</T>
        </View>
        <View style={{flexDirection:'row',gap:S.sm,marginBottom:S.md}}>
          <Stat val={tasks.length} label="Total"/>
          <Stat val={done} label="Done"/>
          <Stat val={overdue} label="Overdue" red={overdue>0}/>
        </View>
        <View style={{marginBottom:S.lg}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:S.xs}}>
            <T s="xxs" c={C.textMuted} up ls={0.12}>Today's progress</T>
            <T s="xxs" c={C.textSub}>{pct}%</T>
          </View>
          <View style={{height:3,backgroundColor:'#d8d7d3'}}><View style={{height:3,backgroundColor:C.primary,width:`${pct}%` as any}}/></View>
        </View>
        <Sec label="Quick actions"/>
        <View style={st.grid}>
          {ACTIONS.map(a=>(
            <TouchableOpacity key={a.label} activeOpacity={0.8} style={[st.card,a.dark&&st.dark]}
              onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);router.push(a.route as any)}}>
              <T s="xs" w="m" up ls={0.09} c={a.dark?C.primaryFg:C.text}>{a.label}</T>
            </TouchableOpacity>
          ))}
        </View>
        <Sec label="Up next"/>
        {upNext.length===0
          ?<T s="xs" c={C.textMuted} style={{paddingVertical:S.lg}}>No pending tasks — tap New Task</T>
          :upNext.map(t=><TaskRow key={t.id} task={t} onComplete={(id,d)=>complete(id,d)}/>)
        }
      </ScrollView>
    </Bg>
  )
}
const st=StyleSheet.create({
  grid:{flexDirection:'row',flexWrap:'wrap',gap:S.sm,marginBottom:S.sm},
  card:{width:'47.5%',borderWidth:1,borderColor:C.border,padding:S.lg,minHeight:70,justifyContent:'flex-end'},
  dark:{backgroundColor:C.primary,borderColor:C.primary},
})

