import { Redirect } from 'expo-router'

// Dočasný vstupní bod — po implementaci auth přesměruje na login nebo dashboard
export default function Index() {
  return <Redirect href="/login" />
}
