import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { tasksApi,bucketApi,notesApi,habitsApi,focusApi,moodApi } from '../api'
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notifications'
import type { TaskFilter,CreateTaskRequest,UpdateTaskRequest,CreateBucketItemRequest,UpdateBucketItemRequest,CreateNoteRequest,UpdateNoteRequest,LogHabitRequest,CreateFocusSessionRequest,CreateMoodLogRequest } from '../types'
const ok  = ()=>Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
const tap = ()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
const mid = ()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
export const useTasks  = (f?:TaskFilter) => useQuery({queryKey:['tasks',f??{}],queryFn:()=>tasksApi.list(f),select:r=>r.data})
export const useTask   = (id:string)     => useQuery({queryKey:['task',id],queryFn:()=>tasksApi.get(id),select:r=>r.data,enabled:!!id})
export const useTags   = ()              => useQuery({queryKey:['tags'],queryFn:()=>tasksApi.listTags(),select:r=>r.data})
export const useCreateTask = () => {
  const qc=useQueryClient()
  return useMutation({
    mutationFn:(b:CreateTaskRequest)=>tasksApi.create(b),
    onSuccess:(res)=>{
      ok()
      qc.invalidateQueries({queryKey:['tasks']})
      if(res.data?.due_date) scheduleTaskNotification(res.data.id,res.data.title,res.data.due_date)
    }
  })
}
export const useUpdateTask = () => {
  const qc=useQueryClient()
  return useMutation({
    mutationFn:({id,body}:{id:string;body:UpdateTaskRequest})=>tasksApi.update(id,body),
    onMutate:async({id,body})=>{ await qc.cancelQueries({queryKey:['tasks']}); const prev=qc.getQueriesData({queryKey:['tasks']}); qc.setQueriesData({queryKey:['tasks']},(old:any)=>old?.data?{...old,data:old.data.map((t:any)=>t.id===id?{...t,...body}:t)}:old); return{prev} },
    onError:(_e,_v,ctx)=>ctx?.prev.forEach(([k,d])=>qc.setQueryData(k,d)),
    onSettled:(_d,_e,vars)=>{ qc.invalidateQueries({queryKey:['tasks']}); if(vars.body.status==='done') cancelTaskNotification(vars.id) },
  })
}
export const useCompleteTask = () => { const u=useUpdateTask(); return {...u,complete:(id:string,done:boolean)=>{done?mid():tap();u.mutate({id,body:{status:done?'done':'pending'}})}} }
export const useDeleteTask   = () => {
  const qc=useQueryClient()
  return useMutation({
    mutationFn:(id:string)=>tasksApi.delete(id),
    onSuccess:(_d,id)=>{ ok(); qc.invalidateQueries({queryKey:['tasks']}); cancelTaskNotification(id) }
  })
}
export const useBucket       = (cat?:string) => useQuery({queryKey:['bucket',cat??''],queryFn:()=>bucketApi.list(cat),select:r=>r.data})
export const useCreateBucket = () => { const qc=useQueryClient(); return useMutation({mutationFn:(b:CreateBucketItemRequest)=>bucketApi.create(b),onSuccess:()=>{ok();qc.invalidateQueries({queryKey:['bucket']})}}) }
export const useUpdateBucket = () => {
  const qc=useQueryClient()
  return useMutation({
    mutationFn:({id,body}:{id:string;body:UpdateBucketItemRequest})=>bucketApi.update(id,body),
    onMutate:async({id,body})=>{ await qc.cancelQueries({queryKey:['bucket']}); const prev=qc.getQueriesData({queryKey:['bucket']}); qc.setQueriesData({queryKey:['bucket']},(old:any)=>old?.data?{...old,data:old.data.map((b:any)=>b.id===id?{...b,...body}:b)}:old); return{prev} },
    onError:(_e,_v,ctx)=>ctx?.prev.forEach(([k,d])=>qc.setQueryData(k,d)),
    onSettled:()=>qc.invalidateQueries({queryKey:['bucket']}),
  })
}
export const useDeleteBucket = () => { const qc=useQueryClient(); return useMutation({mutationFn:(id:string)=>bucketApi.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['bucket']})}) }
export const useNotes        = (tag?:string,search?:string) => useQuery({queryKey:['notes',tag??'',search??''],queryFn:()=>notesApi.list({tag,search}),select:r=>r.data})
export const useNote         = (id:string)                  => useQuery({queryKey:['note',id],queryFn:()=>notesApi.get(id),select:r=>r.data,enabled:!!id})
export const useCreateNote   = () => { const qc=useQueryClient(); return useMutation({mutationFn:(b:CreateNoteRequest)=>notesApi.create(b),onSuccess:()=>{ok();qc.invalidateQueries({queryKey:['notes']})}}) }
export const useUpdateNote   = () => { const qc=useQueryClient(); return useMutation({mutationFn:({id,body}:{id:string;body:UpdateNoteRequest})=>notesApi.update(id,body),onSuccess:(_d,{id})=>{qc.invalidateQueries({queryKey:['notes']});qc.invalidateQueries({queryKey:['note',id]})}}) }
export const useDeleteNote   = () => { const qc=useQueryClient(); return useMutation({mutationFn:(id:string)=>notesApi.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['notes']})}) }
export const useHabits       = ()          => useQuery({queryKey:['habits'],queryFn:()=>habitsApi.list(),select:r=>r.data})
export const useCreateHabit  = ()          => { const qc=useQueryClient(); return useMutation({mutationFn:(name:string)=>habitsApi.create({name}),onSuccess:()=>{ok();qc.invalidateQueries({queryKey:['habits']})}}) }
export const useDeleteHabit  = ()          => { const qc=useQueryClient(); return useMutation({mutationFn:(id:string)=>habitsApi.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['habits']})}) }
export const useLogHabit     = ()          => {
  const qc=useQueryClient()
  return useMutation({
    mutationFn:({id,body}:{id:string;body:LogHabitRequest})=>habitsApi.log(id,body),
    onMutate:async({id,body})=>{ body.done?mid():tap(); await qc.cancelQueries({queryKey:['habits']}); const prev=qc.getQueryData(['habits']); qc.setQueryData(['habits'],(old:any)=>old?.data?{...old,data:old.data.map((h:any)=>{ if(h.id!==id)return h; const logs:string[]=h.week_logs??[]; return{...h,week_logs:body.done?[...new Set([...logs,body.date])]:logs.filter((d:string)=>d!==body.date)} })}:old); return{prev} },
    onError:(_e,_v,ctx)=>qc.setQueryData(['habits'],ctx?.prev),
    onSettled:()=>qc.invalidateQueries({queryKey:['habits']}),
  })
}
export const useFocus        = (date?:string) => useQuery({queryKey:['focus',date??''],queryFn:()=>focusApi.list(date),select:r=>r.data})
export const useCreateFocus  = ()             => { const qc=useQueryClient(); return useMutation({mutationFn:(b:CreateFocusSessionRequest)=>focusApi.create(b),onSuccess:()=>{ok();qc.invalidateQueries({queryKey:['focus']})}}) }
export const useMood         = (limit=30)     => useQuery({queryKey:['mood',limit],queryFn:()=>moodApi.list(limit),select:r=>r.data})
export const useCreateMood   = ()             => { const qc=useQueryClient(); return useMutation({mutationFn:(b:CreateMoodLogRequest)=>moodApi.create(b),onSuccess:()=>{ok();qc.invalidateQueries({queryKey:['mood']})}}) }
