/**
 * Seed skript — importuje 800+ cviků z free-exercise-db do Supabase.
 * Spuštění: npx ts-node --project tsconfig.scripts.json scripts/seed-exercises.ts
 *
 * Vyžaduje SUPABASE_SERVICE_ROLE_KEY v .env (nikdy do gitu!)
 */

import { createClient } from '@supabase/supabase-js'
import * as https from 'https'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Chybí EXPO_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const RAW_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

type RawExercise = {
  id: string
  name: string
  force: string | null
  level: string
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: string[]
}

// Mapování angličtina → část těla (pro filtrování v UI)
const categoryToBodyPart: Record<string, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  arms: 'upper arms',
  legs: 'upper legs',
  calves: 'lower legs',
  abs: 'waist',
  cardio: 'cardio',
  olympic_weightlifting: 'back',
  powerlifting: 'back',
  stretching: 'back',
  plyometrics: 'upper legs',
  strongman: 'back',
}

function fetchJson(url: string): Promise<RawExercise[]> {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => resolve(JSON.parse(data)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  console.log('Stahuji databázi cviků...')
  const raw = await fetchJson(RAW_URL)
  console.log(`Staženo ${raw.length} cviků.`)

  const exercises = raw.map(e => ({
    name: e.name,
    body_part: categoryToBodyPart[e.category] ?? e.category,
    equipment: e.equipment ?? 'body weight',
    category: e.category,
    target: e.primaryMuscles[0] ?? null,
    muscle_group: e.primaryMuscles[0] ?? null,
    secondary_muscles: e.secondaryMuscles,
    instructions: e.instructions,
    is_custom: false,
    created_by: null,
  }))

  console.log('Importuji do Supabase...')
  const BATCH = 100
  let inserted = 0

  for (let i = 0; i < exercises.length; i += BATCH) {
    const batch = exercises.slice(i, i + BATCH)
    const { error } = await supabase
      .from('exercises')
      .upsert(batch, { onConflict: 'name' })
    if (error) { console.error('Chyba:', error.message); process.exit(1) }
    inserted += batch.length
    console.log(`  ${inserted}/${exercises.length}`)
  }

  console.log(`✅ Hotovo — importováno ${inserted} cviků.`)
}

main().catch(err => { console.error(err); process.exit(1) })
