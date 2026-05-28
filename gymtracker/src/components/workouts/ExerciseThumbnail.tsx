import { useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

type Props = {
  uri: string | null | undefined
  name: string
  size?: number
}

// Exercise thumbnail with a first-letter fallback when the image is missing
// or fails to load (free-exercise-db images are hosted on GitHub).
export function ExerciseThumbnail({ uri, name, size = 44 }: Props) {
  const [failed, setFailed] = useState(false)
  const dimension = { width: size, height: size, borderRadius: size / 6 }

  if (!uri || failed) {
    return (
      <View style={[styles.placeholder, dimension]}>
        <Text style={[styles.letter, { fontSize: size * 0.42 }]}>
          {(name.trim()[0] ?? '?').toUpperCase()}
        </Text>
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, dimension]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  )
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#f1f5f9' },
  placeholder: { backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  letter: { fontWeight: '700', color: '#2563eb' },
})
