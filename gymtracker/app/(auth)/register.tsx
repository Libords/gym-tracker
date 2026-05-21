import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '../../src/lib/supabase'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert('Chyba', 'Vyplň všechna pole.')
      return
    }
    if (password !== confirm) {
      Alert.alert('Chyba', 'Hesla se neshodují.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Chyba', 'Heslo musí mít alespoň 6 znaků.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Chyba registrace', error.message)
      return
    }
    if (data.session) {
      // Email confirmation disabled — user is logged in immediately
      return
    }
    Alert.alert('Hotovo', 'Zkontroluj email a potvrď registraci.')
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>GymTracker</Text>
      <Text style={styles.subtitle}>Registrace</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Heslo"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Potvrzení hesla"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Zaregistrovat se</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>Máš účet? Přihlaš se</Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, marginBottom: 14, fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#2563eb', fontSize: 15 },
})
