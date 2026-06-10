import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '../api'
import { setUnauthorizedHandler } from '../api/client'
import type { User,LoginRequest } from '../types'
const KEY = 'maradhi_token'
interface AuthState {
  user:User|null; token:string|null; isLoggedIn:boolean
  login:(c:LoginRequest)=>Promise<void>
  logout:()=>Promise<void>
  loadToken:()=>Promise<void>
}
export const useAuthStore = create<AuthState>((set,get) => {
  setUnauthorizedHandler(()=>get().logout())
  return {
    user:null, token:null, isLoggedIn:false,
    loadToken: async () => {
      try {
        const token = await SecureStore.getItemAsync(KEY)
        if (token) {
          set({ token, isLoggedIn:true })
          authApi.me().then(u=>set({user:u})).catch(()=>{ SecureStore.deleteItemAsync(KEY); set({token:null,isLoggedIn:false}) })
        }
      } catch {}
    },
    login: async (creds) => {
      const res = await authApi.login(creds)
      await SecureStore.setItemAsync(KEY,res.token)
      set({ token:res.token, isLoggedIn:true, user:{ id:res.user_id, username:res.username, email:null, is_admin:res.is_admin, created_at:new Date().toISOString() } })
    },
    logout: async () => { await SecureStore.deleteItemAsync(KEY); set({token:null,user:null,isLoggedIn:false}) },
  }
})

