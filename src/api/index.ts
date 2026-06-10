import { api, apiFetch } from './client'
import type { APIResponse,AuthResponse,LoginRequest,User,Task,CreateTaskRequest,UpdateTaskRequest,TaskFilter,Tag,BucketListItem,CreateBucketItemRequest,UpdateBucketItemRequest,Note,CreateNoteRequest,UpdateNoteRequest,Habit,LogHabitRequest,FocusSession,CreateFocusSessionRequest,MoodLog,CreateMoodLogRequest } from '../types'
export const authApi = {
  login:(b:LoginRequest)=>api.post<AuthResponse>('/auth/login',b),
  me:()=>api.get<User>('/auth/me'),
  register:(b:{username:string;password:string;email?:string})=>apiFetch<AuthResponse>('POST','/auth/register',b,{'X-Admin-Secret':process.env.EXPO_PUBLIC_ADMIN_SECRET??''}),
}
export const tasksApi = {
  list:(f?:TaskFilter)=>{ const p=new URLSearchParams(); if(f?.status)p.set('status',f.status); if(f?.priority)p.set('priority',f.priority); if(f?.due)p.set('due',f.due); const q=p.toString(); return api.get<APIResponse<Task[]>>(`/api/v1/tasks${q?`?${q}`:''}`) },
  get:(id:string)=>api.get<APIResponse<Task>>(`/api/v1/tasks/${id}`),
  create:(b:CreateTaskRequest)=>api.post<APIResponse<Task>>('/api/v1/tasks',b),
  update:(id:string,b:UpdateTaskRequest)=>api.patch<APIResponse<Task>>(`/api/v1/tasks/${id}`,b),
  delete:(id:string)=>api.delete<void>(`/api/v1/tasks/${id}`),
  listTags:()=>api.get<APIResponse<Tag[]>>('/api/v1/tags'),
  createTag:(b:{name:string;color:string})=>api.post<APIResponse<Tag>>('/api/v1/tags',b),
  deleteTag:(id:string)=>api.delete<void>(`/api/v1/tags/${id}`),
}
export const bucketApi = {
  list:(cat?:string)=>api.get<APIResponse<BucketListItem[]>>(`/api/v1/bucket${cat?`?category=${cat}`:''}`),
  create:(b:CreateBucketItemRequest)=>api.post<APIResponse<BucketListItem>>('/api/v1/bucket',b),
  update:(id:string,b:UpdateBucketItemRequest)=>api.patch<APIResponse<BucketListItem>>(`/api/v1/bucket/${id}`,b),
  delete:(id:string)=>api.delete<void>(`/api/v1/bucket/${id}`),
}
export const notesApi = {
  list:(p?:{tag?:string;search?:string})=>{ const q=new URLSearchParams(); if(p?.tag)q.set('tag',p.tag); if(p?.search)q.set('search',p.search); const s=q.toString(); return api.get<APIResponse<Note[]>>(`/api/v1/notes${s?`?${s}`:''}`) },
  get:(id:string)=>api.get<APIResponse<Note>>(`/api/v1/notes/${id}`),
  create:(b:CreateNoteRequest)=>api.post<APIResponse<Note>>('/api/v1/notes',b),
  update:(id:string,b:UpdateNoteRequest)=>api.patch<APIResponse<Note>>(`/api/v1/notes/${id}`,b),
  delete:(id:string)=>api.delete<void>(`/api/v1/notes/${id}`),
}
export const habitsApi = {
  list:()=>api.get<APIResponse<Habit[]>>('/api/v1/habits'),
  create:(b:{name:string})=>api.post<APIResponse<Habit>>('/api/v1/habits',b),
  delete:(id:string)=>api.delete<void>(`/api/v1/habits/${id}`),
  log:(id:string,b:LogHabitRequest)=>api.post<void>(`/api/v1/habits/${id}/log`,b),
}
export const focusApi = {
  list:(date?:string)=>api.get<APIResponse<FocusSession[]>>(`/api/v1/focus${date?`?date=${date}`:''}`),
  create:(b:CreateFocusSessionRequest)=>api.post<APIResponse<FocusSession>>('/api/v1/focus',b),
}
export const moodApi = {
  list:(limit=30)=>api.get<APIResponse<MoodLog[]>>(`/api/v1/mood?limit=${limit}`),
  create:(b:CreateMoodLogRequest)=>api.post<APIResponse<MoodLog>>('/api/v1/mood',b),
}

