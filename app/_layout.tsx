import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono'
import { requestNotificationPermission } from '../src/utils/notifications'
const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,   // data fresh for 5 min — no refetch on tab switch
      gcTime:   10 * 60 * 1000,   // keep cache 10 min
    },
  },
})
export default function Root() {
  useFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold })
  useEffect(() => { requestNotificationPermission() }, [])
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={qc}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
