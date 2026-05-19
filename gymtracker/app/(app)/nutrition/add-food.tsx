import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useDailyMeals, searchOpenFoodFacts, fetchByBarcode, searchUSDA } from '../../../src/hooks/useNutrition'
import type { FoodItem, MealType } from '../../../src/types/nutrition'
import { calcMicros } from '../../../src/types/nutrition'
import { MicronutrientsCard } from '../../../src/components/MicronutrientsCard'

type Source = 'off' | 'usda'

export default function AddFoodScreen() {
  const { mealType, date } = useLocalSearchParams<{ mealType: MealType; date: string }>()
  const router = useRouter()
  const { addMealItem } = useDailyMeals(date)

  const [query, setQuery] = useState('')
  const [source, setSource] = useState<Source>('off')
  const [results, setResults] = useState<FoodItem[]>([])
  const [searching, setSearching] = useState(false)
  const [scannerVisible, setScannerVisible] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [amount, setAmount] = useState('100')
  const [adding, setAdding] = useState(false)
  const [showMicros, setShowMicros] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    const foods = source === 'off'
      ? await searchOpenFoodFacts(query)
      : await searchUSDA(query)
    setResults(foods)
    setSearching(false)
  }

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setScannerVisible(true)
        return
      }
    }
    setScanned(false)
    setScannerVisible(true)
  }

  const handleBarcode = async ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    setScannerVisible(false)
    setSearching(true)
    const food = await fetchByBarcode(data)
    setSearching(false)
    if (food) {
      setSelectedFood(food)
    } else {
      Alert.alert('Nenalezeno', 'Produkt s tímto čárovým kódem nebyl nalezen v databázi.')
      setScanned(false)
    }
  }

  const handleAdd = async () => {
    if (!selectedFood || !amount) return
    setAdding(true)
    await addMealItem(mealType, selectedFood, parseFloat(amount))
    setAdding(false)
    router.back()
  }

  const hasMicros = selectedFood
    ? (selectedFood.vitamin_c_mg != null || selectedFood.calcium_mg != null)
    : false

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Přidat potravinu</Text>
      </View>

      {!selectedFood ? (
        <>
          {/* Source switcher */}
          <View style={styles.sourceTabs}>
            <TouchableOpacity
              style={[styles.sourceTab, source === 'off' && styles.sourceTabActive]}
              onPress={() => { setSource('off'); setResults([]) }}
            >
              <Text style={[styles.sourceTabText, source === 'off' && styles.sourceTabTextActive]}>
                🌍 Open Food Facts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sourceTab, source === 'usda' && styles.sourceTabActive]}
              onPress={() => { setSource('usda'); setResults([]) }}
            >
              <Text style={[styles.sourceTabText, source === 'usda' && styles.sourceTabTextActive]}>
                🔬 USDA (mikronutrienty)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Hledat potravinu..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Hledat</Text>
            </TouchableOpacity>
          </View>

          {source === 'off' && (
            <TouchableOpacity style={styles.barcodeBtn} onPress={openScanner}>
              <Text style={styles.barcodeBtnText}>📷 Skenovat čárový kód</Text>
            </TouchableOpacity>
          )}

          {source === 'usda' && (
            <Text style={styles.usdaHint}>USDA obsahuje detailní mikronutrienty pro základní potraviny (maso, zelenina, ovoce…)</Text>
          )}

          {searching && <ActivityIndicator style={{ marginTop: 20 }} />}

          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.id}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultRow} onPress={() => setSelectedFood(item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                {item.brand && <Text style={styles.resultBrand}>{item.brand}</Text>}
                {item.calories_per_100g != null && (
                  <Text style={styles.resultMacros}>
                    {item.calories_per_100g} kcal  •  B: {item.protein_per_100g ?? '?'}g  S: {item.carbs_per_100g ?? '?'}g  T: {item.fat_per_100g ?? '?'}g  / 100g
                  </Text>
                )}
                {(item.vitamin_c_mg != null || item.calcium_mg != null) && (
                  <Text style={styles.microBadge}>🔬 obsahuje mikronutrienty</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !searching && query ? <Text style={styles.empty}>Žádné výsledky.</Text> : null
            }
          />
        </>
      ) : (
        <ScrollView>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmName}>{selectedFood.name}</Text>
            {selectedFood.brand && <Text style={styles.confirmBrand}>{selectedFood.brand}</Text>}
            {selectedFood.calories_per_100g != null && (
              <Text style={styles.confirmMacros}>
                {selectedFood.calories_per_100g} kcal  •  B: {selectedFood.protein_per_100g ?? '?'}g  S: {selectedFood.carbs_per_100g ?? '?'}g  T: {selectedFood.fat_per_100g ?? '?'}g  / 100g
              </Text>
            )}

            <Text style={styles.amountLabel}>Množství (g)</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            {/* Micronutrients toggle */}
            <TouchableOpacity style={styles.microToggle} onPress={() => setShowMicros(v => !v)}>
              <Text style={styles.microToggleText}>
                {showMicros ? '▲ Skrýt mikronutrienty' : '▼ Zobrazit mikronutrienty'}
              </Text>
            </TouchableOpacity>

            {showMicros && (
              <View style={styles.microSection}>
                {hasMicros ? (
                  <MicronutrientsCard
                    micros={calcMicros(selectedFood, parseFloat(amount) || 100)}
                    compact
                  />
                ) : (
                  <Text style={styles.microNone}>
                    Mikronutrienty nejsou dostupné. Potravina bude automaticky doplněna daty z USDA při přidání.
                  </Text>
                )}
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedFood(null)}>
                <Text>Zpět</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={adding}>
                {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Přidat</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Barcode Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          {!permission?.granted ? (
            <Text style={styles.permissionText}>Přístup ke kameře byl zamítnut.</Text>
          ) : (
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarcode}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
              }}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerHint}>Namiř na čárový kód</Text>
          </View>
          <TouchableOpacity style={styles.closeScannerBtn} onPress={() => { setScannerVisible(false); setScanned(false) }}>
            <Text style={styles.closeScannerText}>Zavřít</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, gap: 12 },
  back: { color: '#2563eb', fontSize: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  sourceTabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  sourceTab: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  sourceTabActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  sourceTabText: { fontSize: 11, color: '#555' },
  sourceTabTextActive: { color: '#fff', fontWeight: '600' },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  searchBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  barcodeBtn: { marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, padding: 12, alignItems: 'center' },
  barcodeBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 15 },
  usdaHint: { marginHorizontal: 16, marginBottom: 10, color: '#888', fontSize: 12, fontStyle: 'italic' },
  resultRow: { padding: 14, borderBottomWidth: 1, borderColor: '#f0f0f0', marginHorizontal: 16 },
  resultName: { fontSize: 15, fontWeight: '500' },
  resultBrand: { color: '#888', fontSize: 13 },
  resultMacros: { color: '#2563eb', fontSize: 12, marginTop: 2 },
  microBadge: { color: '#16a34a', fontSize: 11, marginTop: 2 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  confirmContainer: { padding: 24 },
  confirmName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  confirmBrand: { color: '#888', marginBottom: 8 },
  confirmMacros: { color: '#2563eb', marginBottom: 16 },
  amountLabel: { fontSize: 14, color: '#666', marginBottom: 6 },
  amountInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 18, marginBottom: 12, textAlign: 'center' },
  microToggle: { paddingVertical: 10, alignItems: 'center' },
  microToggleText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  microSection: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, marginBottom: 16 },
  microNone: { color: '#888', fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  addBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 260, height: 160, borderWidth: 2, borderColor: '#fff', borderRadius: 12 },
  scannerHint: { color: '#fff', marginTop: 16, fontSize: 15 },
  closeScannerBtn: { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16, borderRadius: 12 },
  closeScannerText: { color: '#fff', fontSize: 16 },
  permissionText: { color: '#fff', textAlign: 'center', marginTop: 100 },
})
