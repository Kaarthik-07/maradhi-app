import { ScrollView, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bg, T } from '../../src/components/ui'
import { C, S } from '../../src/constants/theme'
import { Ionicons } from '@expo/vector-icons'
const ITEMS=[
  {label:'Bucket List',sub:'Dream big bestie',  icon:'map-outline',           color:C.low,     route:'/(app)/bucket'},
  {label:'Habits',     sub:'Grind sznnnn',       icon:'flame-outline',         color:C.mid,     route:'/(app)/habits'},
  {label:'Lock In',    sub:'No distractions',    icon:'timer-outline',         color:C.low,     route:'/(app)/focus'},
  {label:'Vibes',      sub:'How u feeling rn',   icon:'happy-outline',         color:C.high,    route:'/(app)/mood'},
  {label:'Calendar',   sub:'The schedule',       icon:'calendar-outline',      color:C.primary, route:'/(app)/calendar'},
  {label:'Overdue',    sub:'Needs attention fr', icon:'alert-circle-outline',  color:C.high,    route:'/(app)/tasks/'},
] as const
export default function More() {
  const router=useRouter(),insets=useSafeAreaInsets()
  return (
    <Bg>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:S.xl,paddingTop:insets.top+S.lg,paddingBottom:40}} showsVerticalScrollIndicator={false}>
        <T s="xl" w="b" up ls={0.08} style={{marginBottom:S.xl}}>MORE</T>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:S.sm}}>
          {ITEMS.map(it=>(
            <TouchableOpacity key={it.label} activeOpacity={0.8} style={{width:'47.5%',borderWidth:1,borderColor:C.border,overflow:'hidden',minHeight:100}}
              onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);router.push(it.route as any)}}>
              <View style={{height:3,backgroundColor:it.color}}/>
              <View style={{padding:S.lg,flex:1,justifyContent:'flex-end',gap:S.xs}}>
                <Ionicons name={it.icon as any} size={20} color={C.text}/>
                <T s="xs" w="m" up ls={0.09}>{it.label}</T>
                <T s="xxs" c={C.textMuted} ls={0.06}>{it.sub}</T>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Bg>
  )
}

