// ─── Cycle phases ────────────────────────────────────────────────────────────

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export type CycleLog = {
  id: string
  user_id: string
  period_start: string   // ISO date, first day of period
  cycle_length: number   // default 28
  period_length: number  // default 5
  notes: string | null
}

export type CycleInfo = {
  phase: CyclePhase
  dayInCycle: number        // 1-based day in current cycle
  daysUntilNextPeriod: number
  daysUntilOvulation: number | null  // null if already past
  ovulationDay: number      // which cycle day ovulation falls on
  cycleLength: number
  periodLength: number
  nextPeriodDate: Date
  isLutealLate: boolean     // true if in last 7 days before period (PMS window)
}

// ─── Phase metadata ───────────────────────────────────────────────────────────

export type TrainingLevel = 1 | 2 | 3 | 4 | 5   // 1 = very light, 5 = maximum

export type PhaseRecommendation = {
  phase: CyclePhase
  name: string
  emoji: string
  color: string           // hex
  colorLight: string      // hex, for backgrounds
  energyLevel: TrainingLevel
  trainingIntensity: TrainingLevel
  trainingLabel: string   // "Lehký trénink" / "Silový trénink" ...
  workouts: string[]      // recommended workout types
  trainingTip: string
  trainingWarning?: string
  // Nutrition
  nutritionFocus: string[]  // key nutrients to focus on (Czech)
  eatMore: { emoji: string; food: string; reason: string }[]
  eatLess: { emoji: string; food: string; reason: string }[]
  nutritionTip: string
  // Wellbeing
  expectedSymptoms: string[]
  wellbeingTip: string
}

// ─── All phase recommendations (evidence-based, aligned with FitrWoman / Flo best practice) ──

export const PHASE_DATA: Record<CyclePhase, PhaseRecommendation> = {
  menstrual: {
    phase: 'menstrual',
    name: 'Menstruace',
    emoji: '🔴',
    color: '#ef4444',
    colorLight: '#fef2f2',
    energyLevel: 1,
    trainingIntensity: 2,
    trainingLabel: 'Lehký pohyb',
    workouts: [
      'Jemná jóga nebo yin jóga',
      'Procházka v přírodě',
      'Lehký strečink',
      'Plavání (lehké tempo)',
      'Pilates (regenerační)',
      'Dechová cvičení',
    ],
    trainingTip:
      'Naslouchej svému tělu. Mírný pohyb (procházka, jóga) může zmírnit křeče díky uvolnění endorfinů. Pokud je den silně bolestivý, klidový den je zcela v pořádku.',
    // Nutrition
    nutritionFocus: ['Železo', 'Hořčík', 'Omega-3', 'Vitamin C'],
    eatMore: [
      { emoji: '🥩', food: 'Červené maso, tmavé kuřecí', reason: 'Železo — doplňuje ztráty menstruací' },
      { emoji: '🥬', food: 'Špenát, kapusta, mangold', reason: 'Železo + hořčík — snižuje křeče' },
      { emoji: '🫘', food: 'Čočka, fazole, cizrna', reason: 'Rostlinné železo + bílkoviny' },
      { emoji: '🐟', food: 'Losos, sardinky, makrela', reason: 'Omega-3 — protizánětlivé, méně křečí' },
      { emoji: '🍫', food: 'Hořká čokoláda 70%+', reason: 'Hořčík — uvolňuje svalové křeče' },
      { emoji: '🥜', food: 'Mandle, dýňová semínka', reason: 'Hořčík + zdravé tuky' },
      { emoji: '🍊', food: 'Pomeranče, paprika, kiwi', reason: 'Vitamin C — zvyšuje vstřebávání železa' },
      { emoji: '🫐', food: 'Borůvky, maliny, třešně', reason: 'Antioxidanty — snižují záněty' },
    ],
    eatLess: [
      { emoji: '☕', food: 'Káva, energetické nápoje', reason: 'Kofein zesiluje křeče a podrážděnost' },
      { emoji: '🍺', food: 'Alkohol', reason: 'Zhoršuje únavu a výkyvy nálad' },
      { emoji: '🧂', food: 'Sůl, slané pochutiny', reason: 'Zadržování vody, nadýmání' },
      { emoji: '🍬', food: 'Cukr, slazené nápoje', reason: 'Výkyvy krevního cukru → horší nálada' },
    ],
    nutritionTip:
      'Zaměř se na potraviny bohaté na železo (maso, luštěniny) a vitamin C pro jeho lepší vstřebávání. Hořčík z ořechů a hořké čokolády pomáhá se křečemi.',
    // Wellbeing
    expectedSymptoms: ['Únava', 'Bolesti v podbřišku', 'Bolesti zad', 'Citlivá prsa', 'Výkyvy nálad', 'Nadýmání'],
    wellbeingTip: 'Dopřej si více spánku a tepla. Teplá láhev na břicho, teplá koupel nebo masáž podbřišku mohou zmírnit křeče.',
  },

  follicular: {
    phase: 'follicular',
    name: 'Folikulární fáze',
    emoji: '🌱',
    color: '#22c55e',
    colorLight: '#f0fdf4',
    energyLevel: 4,
    trainingIntensity: 4,
    trainingLabel: 'Silový trénink',
    workouts: [
      'Silový trénink (zvyšuj váhy!)',
      'HIIT intervalový trénink',
      'Spinning, kickbox',
      'Funkční trénink',
      'Zkus nový sport nebo cvik',
      'Střední kardio',
    ],
    trainingTip:
      'Estrogen stoupá → lepší síla, rychlejší regenerace, lepší koordinace a nálada. Ideální čas na nové výzvy, zvyšování vah a progres. Tvé tělo je ochotné.',
    // Nutrition
    nutritionFocus: ['Fermentované potraviny', 'Křížatá zelenina', 'Bílkoviny', 'Komplexní sacharidy'],
    eatMore: [
      { emoji: '🥦', food: 'Brokolice, karfiol, kapusta', reason: 'Indol-3-karbinol — zdravý metabolismus estrogenu' },
      { emoji: '🥚', food: 'Vejce', reason: 'Kompletní bílkoviny, cholin, zdravé tuky' },
      { emoji: '🐔', food: 'Kuřecí, krůtí prsa', reason: 'Libové bílkoviny pro svalový růst' },
      { emoji: '🫙', food: 'Jogurt, kefír, kimchi, tempeh', reason: 'Probiotika — gut health, metabolismus hormonů' },
      { emoji: '🌾', food: 'Quinoa, oves, hnědá rýže', reason: 'Komplexní sacharidy pro stabilní energii' },
      { emoji: '🫚', food: 'Lněná semínka, dýňová semínka', reason: 'Lignany — podpora folikulární fáze (seed cycling)' },
      { emoji: '🥑', food: 'Avokádo', reason: 'Zdravé tuky, folát, E vitamín' },
      { emoji: '🫛', food: 'Cizrna, čočka, edamame', reason: 'Rostlinné bílkoviny + železo' },
    ],
    eatLess: [
      { emoji: '🍔', food: 'Průmyslově zpracované potraviny', reason: 'Narušují hormonální rovnováhu' },
      { emoji: '🍷', food: 'Přebytek alkoholu', reason: 'Narušuje metabolismus estrogenu v játrech' },
    ],
    nutritionTip:
      'Skvělý čas na vyšší příjem bílkovin a komplexních sacharidů. Fermentované potraviny (jogurt, kefír, kimchi) podporují zdravý metabolismus estrogenu.',
    // Wellbeing
    expectedSymptoms: ['Rostoucí energie', 'Lepší nálada', 'Kreativita', 'Sociálnost', 'Lepší soustředění'],
    wellbeingTip: 'Využij nárůst energie pro nové projekty, plánování a sociální aktivity. Folikulární fáze je nejlepší čas na začátky.',
  },

  ovulation: {
    phase: 'ovulation',
    name: 'Ovulace',
    emoji: '⭐',
    color: '#f59e0b',
    colorLight: '#fffbeb',
    energyLevel: 5,
    trainingIntensity: 5,
    trainingLabel: 'Maximální výkon',
    workouts: [
      'Maximální silový trénink (osobní rekordy!)',
      'CrossFit, HIIT na plný výkon',
      'Závodní a týmové sporty',
      'Těžké intervalové tréninky',
      'Atletika, sprinty',
      'Skupinová fitness lekce',
    ],
    trainingTip:
      'Toto je tvůj vrchol výkonu! Energie, síla a nálada jsou na maximu. Ideální den na osobní rekordy a nejtěžší tréninky.',
    trainingWarning:
      '⚠️ Relaxin (hormon) je zvýšený → větší laxita vazů, zejména kolen a kotníků. Důkladně se rozehřej a dej pozor na stabilizaci kloubů.',
    // Nutrition
    nutritionFocus: ['Zinek', 'Antioxidanty', 'B vitaminy', 'Protizánětlivé látky'],
    eatMore: [
      { emoji: '🎃', food: 'Dýňová semínka, sezam', reason: 'Zinek — podporuje ovulaci a hormonální produkci' },
      { emoji: '🥚', food: 'Vejce', reason: 'Zinek, cholin, B12 — důležité v tomto období' },
      { emoji: '🫘', food: 'Cizrna, fazole, mořské plody', reason: 'Zinek + bílkoviny' },
      { emoji: '🍓', food: 'Jahody, borůvky, granátové jablko', reason: 'Silné antioxidanty, vitamin C' },
      { emoji: '🥬', food: 'Listová zelenina, chřest', reason: 'Folát, B vitaminy — kritické v ovulaci' },
      { emoji: '🐟', food: 'Losos, tuňák, sardinky', reason: 'Omega-3, B12 — protizánětlivé' },
      { emoji: '🫙', food: 'Hořká čokoláda 85%+', reason: 'Antioxidanty, zinek, hořčík' },
      { emoji: '🧄', food: 'Kurkuma, zázvor, česnek', reason: 'Silně protizánětlivé' },
    ],
    eatLess: [
      { emoji: '🍔', food: 'Těžká, tučná jídla', reason: 'Zpomalují trávení a zátěž před výkonem' },
      { emoji: '🥤', food: 'Přebytek cukru', reason: 'Výkyvy krevního cukru narušují výkon' },
    ],
    nutritionTip:
      'Zaměř se na potraviny bohaté na zinek (semínka, vejce, mořské plody) a antioxidanty. Dobře se hydratuj — výkyvy tělesné teploty jsou v tomto období vyšší.',
    // Wellbeing
    expectedSymptoms: ['Vrchol energie', 'Sebevědomí', 'Sociálnost', 'Mírné tahání v břiše (Mittelschmerz)', 'Průzračný hlen'],
    wellbeingTip: 'Využij maximální energii a sebevědomí. Skvělý čas na důležité rozhovory, prezentace, sportovní výkony.',
  },

  luteal: {
    phase: 'luteal',
    name: 'Luteální fáze',
    emoji: '🌙',
    color: '#8b5cf6',
    colorLight: '#f5f3ff',
    energyLevel: 2,
    trainingIntensity: 3,
    trainingLabel: 'Střední / lehký trénink',
    workouts: [
      'Střední silový trénink (snižuj váhy o ~10–15 %)',
      'Pilates',
      'Plavání',
      'Jóga, yin jóga',
      'Procházky, lehká turistika',
      'Střední kardio (ne HIIT)',
    ],
    trainingTip:
      'Progesteron stoupá a energie klesá. Raná luteální fáze je stále dobrá na střední tréninky. V pozdní luteální fázi (posledních 7 dní před menstruací) snižuj intenzitu, přidej jógu a regeneraci.',
    // Nutrition
    nutritionFocus: ['Hořčík', 'Vápník', 'Vitamin B6', 'Komplexní sacharidy', 'Omega-3'],
    eatMore: [
      { emoji: '🍫', food: 'Hořká čokoláda 70%+', reason: 'Hořčík — snižuje PMS, křeče, náladu' },
      { emoji: '🥜', food: 'Mandle, kešu, lněná semínka', reason: 'Hořčík + zdravé tuky' },
      { emoji: '🥛', food: 'Mléčné výrobky, fortif. rostl. mléka', reason: 'Vápník — klinicky snižuje PMS příznaky' },
      { emoji: '🥦', food: 'Brokolice, kapusta, tempeh', reason: 'Vápník + B6 + metabolismus hormonů' },
      { emoji: '🍌', food: 'Banán', reason: 'B6, draslík — zlepšuje náladu (serotonin)' },
      { emoji: '🐔', food: 'Kuřecí, losos, tuňák', reason: 'Vitamin B6 — klíčový pro náladu a PMS' },
      { emoji: '🥔', food: 'Batáty, hnědá rýže, ovesné vločky', reason: 'Komplexní sacharidy — stabilizují krevní cukr a náladu' },
      { emoji: '🫚', food: 'Chia semínka, vlašské ořechy', reason: 'Omega-3 — protizánětlivé, méně PMS' },
    ],
    eatLess: [
      { emoji: '☕', food: 'Káva, kofein', reason: 'Zesiluje úzkost, nespavost, citlivost prsou' },
      { emoji: '🍷', food: 'Alkohol', reason: 'Zesiluje úzkost a depresivní náladu' },
      { emoji: '🧂', food: 'Sůl, slané pochutiny', reason: 'Zadržování vody, nadýmání, otoky' },
      { emoji: '🍬', food: 'Rafinovaný cukr, sladkosti', reason: 'Výkyvy cukru → horší nálada a chutě na jídlo' },
      { emoji: '🌶️', food: 'Přehnaně kořeněná jídla', reason: 'Mohou zhoršit GI problémy a pocení' },
    ],
    nutritionTip:
      'Hořčík a vápník jsou tvoji nejlepší přátelé. Studie ukazují, že suplementace 300–400 mg hořčíku denně výrazně snižuje PMS. Komplexní sacharidy (ne cukr) stabilizují náladu přes serotonin.',
    // Wellbeing
    expectedSymptoms: ['Únava', 'Zadržování vody', 'Nadýmání', 'Citlivost prsou', 'Výkyvy nálad', 'Chuť na sladké / slané', 'Podrážděnost (PMS)'],
    wellbeingTip: 'Buď k sobě laskavá. Snižuj stres, choď dříve spát, vyhni se přetěžování. Teplá koupel s hořčíkovou solí (Epsom sůl) pomáhá se svalovým napětím.',
  },
}

// ─── Phase calculation ────────────────────────────────────────────────────────

/**
 * Calculate current cycle phase from the most recent period start date.
 * Returns null if no data.
 */
export function calcCycleInfo(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): CycleInfo {
  const start = new Date(lastPeriodStart)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)

  // How many days since last period start (1-based)
  const daysSince = Math.floor((today.getTime() - start.getTime()) / 86400000)

  // If today is before the period start (data error), treat as day 1
  const rawDay = daysSince + 1

  // Wrap into current cycle (handles multiple cycle lengths elapsed)
  const dayInCycle = ((rawDay - 1) % cycleLength) + 1

  // Ovulation happens roughly cycleLength - 14 days into the cycle
  const ovulationDay = Math.max(cycleLength - 14, periodLength + 2)

  // Phase boundaries
  let phase: CyclePhase
  if (dayInCycle <= periodLength) {
    phase = 'menstrual'
  } else if (dayInCycle < ovulationDay - 1) {
    phase = 'follicular'
  } else if (dayInCycle <= ovulationDay + 1) {
    phase = 'ovulation'
  } else {
    phase = 'luteal'
  }

  // Days until next period
  const daysUntilNextPeriod = cycleLength - dayInCycle + 1

  // Days until ovulation
  const daysUntilOvulation =
    dayInCycle < ovulationDay ? ovulationDay - dayInCycle : null

  // Next period date
  const nextPeriodDate = new Date(start)
  const cyclesElapsed = Math.floor((rawDay - 1) / cycleLength)
  nextPeriodDate.setDate(nextPeriodDate.getDate() + (cyclesElapsed + 1) * cycleLength)

  // Is late luteal (PMS window: last 7 days)
  const isLutealLate = phase === 'luteal' && dayInCycle >= cycleLength - 7

  return {
    phase,
    dayInCycle,
    daysUntilNextPeriod,
    daysUntilOvulation,
    ovulationDay,
    cycleLength,
    periodLength,
    nextPeriodDate,
    isLutealLate,
  }
}

/**
 * Build a 35-day phase timeline starting from lastPeriodStart.
 * Returns array of { date, phase } for rendering a calendar.
 */
export function buildCycleTimeline(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number,
  days = 35
): { date: Date; phase: CyclePhase; dayInCycle: number }[] {
  const start = new Date(lastPeriodStart)
  start.setHours(0, 0, 0, 0)
  const ovulationDay = Math.max(cycleLength - 14, periodLength + 2)
  const result = []

  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dayInCycle = ((i) % cycleLength) + 1

    let phase: CyclePhase
    if (dayInCycle <= periodLength) phase = 'menstrual'
    else if (dayInCycle < ovulationDay - 1) phase = 'follicular'
    else if (dayInCycle <= ovulationDay + 1) phase = 'ovulation'
    else phase = 'luteal'

    result.push({ date, phase, dayInCycle })
  }
  return result
}
