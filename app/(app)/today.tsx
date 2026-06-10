import { ScrollView, View, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTasks, useCompleteTask, useDeleteTask } from '../../src/hooks'
import { Bg, T, Sec, Btn, Empty } from '../../src/components/ui'
import { TaskRow } from '../../src/components/TaskRow'
import { C, S } from '../../src/constants/theme'
import type { Task } from '../../src/types'
export default function Today() {
  const router=useRouter(),insets=useSafeAreaInsets()
  const {complete}=useCompleteTask(),del=useDeleteTask()
  const {data:tasks=[],refetch,isRefetching}=useTasks({due:'today'})
  const high=tasks.filter(t=>t.priority==='high'),med=tasks.filter(t=>t.priority==='medium'),low=tasks.filter(t=>t.priority==='low')
  const done=tasks.filter(t=>t.status==='done').length,pct=tasks.length?Math.round((done/tasks.length)*100):0
  const today=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'}).toUpperCase()
  const Grp=({label,items}:{label:string;items:Task[]})=>items.length===0?null:(<><Sec label={label}/>{items.map(t=><TaskRow key={t.id} task={t} onComplete={(id,d)=>complete(id,d)} onDelete={id=>del.mutate(id)}/>)}</>)
  return (
    <Bg>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:S.xl,paddingTop:insets.top+S.lg,paddingBottom:40}}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary}/>} showsVerticalScrollIndicator={false}>
        <View style={{marginBottom:S.lg}}><T s="xxs" c={C.textMuted} up ls={0.18}>{today}</T><T s="xxl" w="b" up ls={0.08} style={{marginTop:4}}>TODAY</T></View>
        <View style={{marginBottom:S.lg}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:S.xs}}><T s="xxs" c={C.textMuted} up ls={0.12}>Progress</T><T s="xxs" c={C.textSub}>{done}/{tasks.length} done</T></View>
          <View style={{height:3,backgroundColor:'#d8d7d3'}}><View style={{height:3,backgroundColor:C.primary,width:`${pct}%` as any}}/></View>
        </View>
        <Grp label="High priority" items={high}/><Grp label="Medium" items={med}/><Grp label="Low" items={low}/>
        {tasks.length===0&&<Empty msg="No tasks today"/>}
        <Btn label="+ NEW TASK" onPress={()=>router.push('/(app)/tasks/new' as any)} style={{marginTop:S.xl}}/>
      </ScrollView>
    </Bg>
  )
}

