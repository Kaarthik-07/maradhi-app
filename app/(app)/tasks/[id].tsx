import { View, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useTask, useUpdateTask, useDeleteTask } from '../../../src/hooks'
import { Bg, T, PBadge, Btn, Loading, Sec } from '../../../src/components/ui'
import { C, S } from '../../../src/constants/theme'
const fmt=(iso:string)=>new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
export default function TaskDetail() {
  const {id}=useLocalSearchParams<{id:string}>(),router=useRouter()
  const {data:task,isLoading}=useTask(id),update=useUpdateTask(),del=useDeleteTask()
  if(isLoading||!task)return<Bg><Loading/></Bg>
  const isDone=task.status==='done'
  return (
    <Bg>
      <TouchableOpacity onPress={()=>router.back()} style={{paddingHorizontal:S.xl,paddingTop:56,paddingBottom:S.sm}}><T s="xs" c={C.textMuted} up ls={0.1}>← Back</T></TouchableOpacity>
      <ScrollView contentContainerStyle={{padding:S.xl,paddingTop:S.sm,paddingBottom:60}} showsVerticalScrollIndicator={false}>
        <View style={[st.titleBlock,{borderLeftColor:C.high}]}>
          <T s="md" w="b" style={isDone?{textDecorationLine:'line-through',opacity:0.5}:{}}>{task.title}</T>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,marginTop:S.xs}}>
            <PBadge p={task.priority}/>
            {task.due_date&&<T s="xxs" c={C.textMuted}>Due {fmt(task.due_date)}</T>}
          </View>
        </View>
        {[{label:'Status',val:task.status},{label:'Created',val:fmt(task.created_at)},...(task.due_date?[{label:'Due',val:fmt(task.due_date)}]:[])].map(r=>(
          <View key={r.label} style={st.row}><T s="xxs" c={C.textMuted} up ls={0.1} style={{flex:1}}>{r.label}</T><T s="xs">{r.val}</T></View>
        ))}
        {task.tags.length>0&&(<View style={st.row}><T s="xxs" c={C.textMuted} up ls={0.1} style={{flex:1}}>Tags</T><View style={{flexDirection:'row',gap:S.xs}}>{task.tags.map(tag=><View key={tag.id} style={{borderWidth:1,borderColor:tag.color,paddingHorizontal:S.xs,paddingVertical:2}}><T s="xxs" c={tag.color} up ls={0.08}>{tag.name}</T></View>)}</View></View>)}
        {task.notes&&(<><Sec label="Notes"/><T s="xs" c={C.textSub} style={{lineHeight:20}}>{task.notes}</T></>)}
        <View style={st.actions}>
          <Btn label="DELETE" danger onPress={()=>Alert.alert('Delete?',task.title,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);del.mutate(id,{onSuccess:()=>router.back()})}}])} style={{flex:1}}/>
          <Btn label={isDone?'MARK PENDING':'MARK DONE'} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);update.mutate({id,body:{status:isDone?'pending':'done'}},{onSuccess:()=>router.back()})}} loading={update.isPending} style={{flex:2}}/>
        </View>
      </ScrollView>
    </Bg>
  )
}
const st=StyleSheet.create({
  titleBlock:{borderLeftWidth:3,paddingLeft:S.md,paddingVertical:S.md,backgroundColor:'rgba(0,0,0,0.04)',marginBottom:S.lg},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:S.md,borderBottomWidth:1,borderBottomColor:C.borderLight},
  actions:{flexDirection:'row',gap:S.sm,marginTop:S.xxl},
})

