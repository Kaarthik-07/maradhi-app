import * as SecureStore from 'expo-secure-store'
export const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
export class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); this.name = 'ApiError' }
}
let onUnauth: (() => void) | null = null
export const setUnauthorizedHandler = (fn: () => void) => { onUnauth = fn }
export async function apiFetch<T>(method: string, path: string, body?: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    const token = await SecureStore.getItemAsync('maradhi_token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (extraHeaders) Object.assign(headers, extraHeaders)
    const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
    if (res.status === 401) {
        const data = await res.json().catch(() => ({}))
        if (token) {
            // Token expired — clear it and redirect to login
            await SecureStore.deleteItemAsync('maradhi_token')
            onUnauth?.()
        }
        // Use the server's actual error message ("invalid credentials")
        throw new ApiError(401, data.message ?? 'Unauthorized')
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new ApiError(res.status, data.message ?? 'Request failed')
    return data as T
}
export const api = {
    get: <T>(p: string) => apiFetch<T>('GET', p),
    post: <T>(p: string, b?: unknown) => apiFetch<T>('POST', p, b),
    patch: <T>(p: string, b?: unknown) => apiFetch<T>('PATCH', p, b),
    delete: <T>(p: string) => apiFetch<T>('DELETE', p),
}

