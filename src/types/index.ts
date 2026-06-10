export type Priority   = 'high'|'medium'|'low'
export type TaskStatus = 'pending'|'done'|'draft'
export type Mood       = 'great'|'good'|'okay'|'low'
export interface User { id:string; username:string; email:string|null; is_admin:boolean; created_at:string }
export interface AuthResponse { token:string; user_id:string; username:string; is_admin:boolean }
export interface LoginRequest { username:string; password:string }
export interface Tag { id:string; user_id:string; name:string; color:string }
export interface Task { id:string; user_id:string; title:string; notes:string|null; priority:Priority; status:TaskStatus; due_date:string|null; tags:Tag[]; created_at:string; updated_at:string }
export interface CreateTaskRequest { title:string; notes?:string; priority:Priority; due_date?:string; tag_ids?:string[] }
export interface UpdateTaskRequest { title?:string; notes?:string; priority?:Priority; status?:TaskStatus; due_date?:string|null; tag_ids?:string[] }
export interface TaskFilter { status?:TaskStatus; priority?:Priority; due?:'today'|'overdue' }
export interface BucketListItem { id:string; user_id:string; title:string; description:string|null; category:string; is_done:boolean; completed_at:string|null; created_at:string }
export interface CreateBucketItemRequest { title:string; description?:string; category:string }
export interface UpdateBucketItemRequest { title?:string; description?:string; category?:string; is_done?:boolean }
export interface Note { id:string; user_id:string; title:string; content:string; tag_label:string; created_at:string; updated_at:string }
export interface CreateNoteRequest { title:string; content:string; tag_label:string }
export interface UpdateNoteRequest { title?:string; content?:string; tag_label?:string }
export interface Habit { id:string; user_id:string; name:string; created_at:string; week_logs:string[] }
export interface LogHabitRequest { date:string; done:boolean }
export interface FocusSession { id:string; user_id:string; duration_minutes:number; task_note:string|null; started_at:string; ended_at:string; created_at:string }
export interface CreateFocusSessionRequest { duration_minutes:number; task_note?:string; started_at:string; ended_at:string }
export interface MoodLog { id:string; user_id:string; mood:Mood; note:string|null; logged_at:string; created_at:string }
export interface CreateMoodLogRequest { mood:Mood; note?:string; logged_at:string }
export interface APIResponse<T> { data:T; count?:number }

