import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useProfile } from '../../src/hooks/useProfile'

export default function ProfileScreen() {
  const { profile, loading, updateProfile } = useProfile()
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setAge(profile.age?.toString() ?? '')
      setHeight(profile.height_cm?.toString() ?? '')
      setTargetWeight(profile.target_weight_kg?.toString() ?? '')
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateProfile({
      full_name: fullName || null,
      age: age ? parseInt(age) : null,
      height_cm: height ? parseInt(height) : null,
      target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
    })
    setSaving(false)
    if (error) Alert.alert('Chyba', error.message)
    else Alert.alert('Uloženo', 'Profil byl aktualizován.')
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Můj profil</Text>

        <Text style={styles.label}>Jméno</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Tvoje jméno" />

        <Text style={styles.label}>Věk</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Věk" />

        <Text style={styles.label}>Výška (cm)</Text>
        <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="Výška v cm" />

        <Text style={styles.label}>Cílová váha (kg)</Text>
        <TextInput style={styles.input} value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" placeholder="Cílová váha v kg" />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Uložit profil</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
