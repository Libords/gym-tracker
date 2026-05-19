import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from '../src/context/AuthContext'
import { setupNotificationHandler } from '../src/lib/notifications'

export default function RootLayout() {
  useEffect(() => {
    setupNotificationHandler()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
