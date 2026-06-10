import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { C, F } from '../../src/constants/theme'

type IName = React.ComponentProps<typeof Ionicons>['name']

const TABS = [
  { name: 'index',    label: 'HOME',     off: 'home-outline' as IName,           on: 'home' as IName },
  { name: 'tasks',    label: 'TASKS',    off: 'albums-outline' as IName,         on: 'albums' as IName },
  { name: 'notes',    label: 'NOTES',    off: 'document-text-outline' as IName,  on: 'document-text' as IName },
  { name: 'calendar', label: 'CALENDAR', off: 'calendar-outline' as IName,       on: 'calendar' as IName },
  { name: 'profile',  label: 'PROFILE',  off: 'person-outline' as IName,         on: 'person' as IName },
]

const HIDDEN = [
  'today', 'note-new', 'note-detail', 'note-editor',
  'habits', 'focus', 'mood', 'bucket', 'more', 'add-user',
]

const HIDDEN_OPT = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' as const, width: 0, overflow: 'hidden' as const },
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        // Keep screens alive after first visit — no re-mount on tab switch
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: '#c8c7c2',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: '#bbbbbb',
        tabBarLabelStyle: { fontFamily: F.r, fontSize: 8, letterSpacing: 0.8 },
      }}
    >
      {TABS.map(t => (
        <Tabs.Screen key={t.name} name={t.name} options={{
          title: t.label,
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? t.on : t.off} size={20} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary, marginTop: 2 }} />
              )}
            </View>
          ),
        }} />
      ))}
      {HIDDEN.map(name => (
        <Tabs.Screen key={name} name={name} options={HIDDEN_OPT} />
      ))}
    </Tabs>
  )
}
