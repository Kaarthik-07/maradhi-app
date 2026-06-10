import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Bg, Loading } from '../../src/components/ui'

export default function NoteNew() {
  const router = useRouter()
  useEffect(() => { router.replace('/(app)/note-editor' as any) }, [])
  return <Bg><Loading /></Bg>
}
