import { Redirect, Tabs } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { ActivityIndicator, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type IconName = React.ComponentProps<typeof Ionicons>['name']

function TabIcon(name: IconName, activeName: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? activeName : name} color={color} size={24} />
  )
}

export default function AppLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Přehled',
          tabBarIcon: TabIcon('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Tréninky',
          tabBarIcon: TabIcon('barbell-outline', 'barbell'),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Výživa',
          tabBarIcon: TabIcon('restaurant-outline', 'restaurant'),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: TabIcon('trending-up-outline', 'trending-up'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: TabIcon('person-outline', 'person'),
        }}
      />
    </Tabs>
  )
}
