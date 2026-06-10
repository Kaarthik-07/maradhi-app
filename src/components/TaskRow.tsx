import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { C, S } from '../constants/theme'
import { Check, PBar, T } from './ui'
import type { Task } from '../types'
function fmtDue(iso:string) {
  const d=new Date(iso),now=new Date()
  const diff=Math.floor((d.getTime()-now.getTime())/86400000)
  const hasTime=!/T00:00|T09:00/.test(iso)&&d.getHours()!==9
  const timePart=hasTime?` ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}`:'  '
  if(diff<0) return{label:`Overdue${timePart}`,red:true}
  if(diff===0) return{label:`Today${timePart}`,red:false}
  if(diff===1) return{label:`Tomorrow${timePart}`,red:false}
  return{label:`${d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}${timePart}`,red:false}
}
export function TaskRow({ task,onComplete,onDelete }: {task:Task;onComplete:(id:string,done:boolean)=>void;onDelete?:(id:string)=>void}) {
  const router=useRouter(), isDone=task.status==='done', due=task.due_date?fmtDue(task.due_date):null
  return (
    <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,paddingVertical:S.sm,paddingRight:S.md,backgroundColor:'rgba(0,0,0,0.04)',marginBottom:5,opacity:isDone?0.45:1}}>
      <PBar p={task.priority}/>
      <Check checked={isDone} onPress={()=>{Haptics.impactAsync(isDone?Haptics.ImpactFeedbackStyle.Light:Haptics.ImpactFeedbackStyle.Medium);onComplete(task.id,!isDone)}}/>
      <TouchableOpacity style={{flex:1}} activeOpacity={0.7} onPress={()=>router.push(`/(app)/tasks/${task.id}` as any)}>
        <T s="sm" style={isDone?{textDecorationLine:'line-through',color:C.textMuted}:{}}>{task.title}</T>
        {due&&<T s="xxs" c={due.red?C.danger:C.textMuted} ls={0.05} style={{marginTop:2}}>{due.label}</T>}
      </TouchableOpacity>
      {task.tags.length>0&&<View style={{width:8,height:8,borderRadius:4,backgroundColor:task.tags[0].color}}/>}
    </View>
  )
}

