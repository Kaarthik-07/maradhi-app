// expo-notifications is not available in Expo Go on Android (SDK 53+).
// All functions gracefully no-op when the module can't load.

let _N: any = null

function getN(): any | null {
  if (_N !== null) return _N === false ? null : _N
  try {
    _N = require('expo-notifications')
    _N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
  } catch {
    _N = false
  }
  return _N === false ? null : _N
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const N = getN()
    if (!N) return false
    const { status: existing } = await N.getPermissionsAsync()
    if (existing === 'granted') return true
    const { status } = await N.requestPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

export async function scheduleTaskNotification(taskId: string, title: string, dueDate: string) {
  try {
    const N = getN()
    if (!N) return
    const due = new Date(dueDate)
    const now = new Date()
    const msBefore = due.getTime() - now.getTime()
    if (msBefore <= 0) return
    const notifyAt = msBefore > 15 * 60 * 1000
      ? new Date(due.getTime() - 15 * 60 * 1000)
      : due
    await N.scheduleNotificationAsync({
      identifier: `task-${taskId}`,
      content: {
        title: 'MARADHI — DA REMEMBER!',
        body: title,
        sound: true,
        data: { taskId },
      },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: notifyAt },
    })
  } catch {
    // Silently fail — notifications are non-critical
  }
}

export async function cancelTaskNotification(taskId: string) {
  try {
    const N = getN()
    if (!N) return
    await N.cancelScheduledNotificationAsync(`task-${taskId}`)
  } catch {}
}
