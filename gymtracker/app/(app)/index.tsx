import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GymTracker</Text>
      <Text style={styles.subtitle}>Přihlášen jako: {user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Odhlásit se</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 32 },
  button: { backgroundColor: '#ef4444', borderRadius: 10, padding: 14, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
