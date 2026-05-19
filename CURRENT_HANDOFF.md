# CURRENT_HANDOFF.md — GymTracker

Aktuální stav projektu pro předání kontextu v nové konverzaci.
**Vždy čti tento soubor jako první.**

---

## Přehled projektu

**GymTracker** — mobilní aplikace (iOS + Android) pro fitness sledování.

Funkce implementované:
- Auth (login/register/onboarding wizard)
- Záznamy tréninků (workouts + exercises + series)
- Jídelníček (Open Food Facts + barcode + USDA mikronutrienty)
- Progress tracker (váha + graf + tělesné míry)
- Cyklus tracking (osobní pro ženy, partner mode pro muže)
- BMR/TDEE kalkulace + dynamické calorie/macro goals
- Bottom tabs dashboard

---

## Tech stack

| Vrstva | Technologie |
|---|---|
| Mobile | Expo SDK 54 (React Native) + TypeScript |
| Routing | Expo Router v3 (file-based, groups) |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Styling | StyleSheet.create |
| Icons | @expo/vector-icons (Ionicons) |
| Food API | Open Food Facts (primary) + USDA FDC (mikronutrienty) |
| Spec-driven dev | spec-kit v0.8.11 (slash commandy /speckit.*) |

---

## Projektová struktura

```
gym-tracker/                    ← root repozitář
├── gymtracker/                 ← Expo app
│   ├── app/
│   │   ├── (auth)/            ← login, register
│   │   └── (app)/             ← chráněné screeny
│   │       ├── _layout.tsx    ← bottom tabs (5 tabů)
│   │       ├── index.tsx      ← Dashboard
│   │       ├── onboarding.tsx ← 5-krokový wizard
│   │       ├── profile.tsx    ← edit profilu + TDEE recalc
│   │       ├── workouts/      ← seznam + detail + new
│   │       ├── nutrition/     ← jídelníček + add-food
│   │       └── progress/      ← váha + míry + cyklus
│   └── src/
│       ├── lib/
│       │   ├── supabase.ts
│       │   └── bmr.ts         ← BMR/TDEE kalkulace
│       ├── context/AuthContext.tsx
│       ├── hooks/
│       │   ├── useProfile.ts
│       │   ├── useWorkouts.ts
│       │   ├── useNutrition.ts ← USDA enrichment
│       │   ├── useProgress.ts
│       │   └── useCycle.ts    ← mode: 'personal' | 'partner'
│       ├── types/
│       │   ├── workout.ts
│       │   ├── nutrition.ts   ← 18 mikronutrientů
│       │   └── cycle.ts       ← fáze + PARTNER_PERSPECTIVE
│       └── components/
│           └── MicronutrientsCard.tsx
├── PROJECT_PLAN.md            ← source of truth pro priority
├── DEV_DIARY.md               ← log kroků
├── CURRENT_HANDOFF.md         ← tento soubor
├── AGENTS.md                  ← execution pravidla
└── CLAUDE.md                  ← instrukce pro Claude
```

---

## Supabase DB schéma (aktuální stav)

### Tabulky
- `profiles` — user profil (gender, birth_year, height_cm, current_weight_kg, target_weight_kg, job_activity, training_days_per_week, training_avg_duration_min, training_types[], calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, has_partner_cycle, onboarding_done)
- `workouts` — záznamy tréninků (user_id, name, started_at, finished_at, notes)
- `exercises` — databáze cviků (name, muscle_group, is_custom, user_id) ← **rozšíření plánováno v H1/H2**
- `workout_sets` — série (workout_id, exercise_id, set_number, reps, weight_kg, rest_seconds)
- `meals` — jídla (user_id, date, meal_type)
- `meal_items` — položky jídla (meal_id, food_item_id, amount_g)
- `food_database` — potraviny (name, calories_per_100g, protein_g, carbs_g, fat_g, barcode + 18 mikro sloupců)
- `weight_logs` — záznamy váhy (user_id, date, weight_kg)
- `body_measurements` — tělesné míry (user_id, date, chest_cm, waist_cm, hips_cm, arm_cm, thigh_cm)
- `cycle_logs` — záznamy cyklu (user_id, date, cycle_day, cycle_length, is_partner)

### Env proměnné
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_USDA_API_KEY=FhMTR3rnYBaEAIe8KbWueatKHZjoBX05mGohVqcW
```

---

## Co je NEXT

**Sprint I — Workout UX Polish ✅ KÓD HOTOV** (40 tasků implementováno na branch `001-workout-ux-polish`, Supabase migrace aplikovaná).

### Co bylo přidáno do app
- **Workout Templates** (Strong-style): uložené rutiny s target sets/reps/weight, 1-tap start, missing-exercise toast, dialog pro rozpracovaný workout, chevron ▲/▼ reorder
- **Rest Timer**: countdown po addSet (default z `profiles.default_rest_seconds`), local push notif přes expo-notifications, AsyncStorage cold-start restore, +15 s / Pauza / Skip akce, permission-denied Alert s openSettings
- **Historie tréninků**: paginated list 30/page, day grouping (lokální TZ), per-cvik detail s max weight + total volume
- **Equipment filtr**: 8 chipů v exercise pickeru, multi-select, AND s body_part filter, ve workouts/[id] i templates/[id]
- **`preferred_unit` kg/lb**: globální preference v profilu, display-layer konverze (DB drží canonical kg), `WeightInput` reusable komponenta
- **`default_rest_seconds`**: configurable v profilu (5–600 s)

### Nové DB objekty (aplikováno migrací 20260520)
- `workout_templates` (id, user_id, name, created_at, updated_at + RLS + trigger touch)
- `template_exercises` (id, template_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg + UNIQUE(template_id, order_index) + RLS via JOIN)
- `profiles.default_rest_seconds INT DEFAULT 90 CHECK 5..600`
- `profiles.preferred_unit TEXT DEFAULT 'kg' CHECK IN ('kg','lb')`
- `workouts.template_id UUID NULL FK → workout_templates ON DELETE SET NULL`

### Co zbývá ze Sprintu I — manuální QA na uživateli
- **T035** — celý [specs/001-workout-ux-polish/quickstart.md](specs/001-workout-ux-polish/quickstart.md) na fyz. iOS + Android (T1.1–T4.6 + TG.1–TG.3 + Regression)
- **T038** — SC měření (SC-001 čas z šablony do 1. série, SC-002 rest notif latency, SC-003 historie FPS, SC-008 kg↔lb propagace < 500 ms)
- **T040** — RLS verify ze second test accountu (`SELECT * FROM workout_templates` vrací 0 cizích řádků)
- (Volitelné) merge `001-workout-ux-polish` do `main` po QA

### Známé limity / pragmatika
- DnD reorder cviků v šabloně **nepoužívá** `react-native-draggable-flatlist` — chevron ▲/▼ tlačítka (research.md R3 akceptovatelný fallback; RN 0.81/Reanimated 4 kompatibilní risk)
- Foreground done sound **není** přes expo-av asset — řeší `setupNotificationHandler` s `shouldPlaySound: true` (OS hraje notification sound i v popředí); haptika navíc
- `expo-notifications` v Expo Go má od SDK 53+ omezení — pro plný test rest-timer notifikací v pozadí potřebuje dev build (`eas build --profile development`)

### Další Sprint po dokončení QA
Sprint J — Statistics & Insights (PR per exercise, volume tracking, frequency heatmap, nutrition trends, weight trend line). Viz PROJECT_PLAN.md.

---

## spec-kit — NAINSTALOVÁNO

spec-kit v0.8.11 je nainstalován. Používat pro všechny nové featury:

**Workflow (nová session pro každý krok):**
1. `/speckit.specify` — popiš feature z pohledu uživatele
2. `/speckit.clarify` — doplnění nejasností
3. `/speckit.plan` — architektonický plán
4. `/speckit.tasks` — granulární tasky
5. `/speckit.analyze` — kontrola konzistence
6. `/speckit.implement` — implementace (zeptej se na počet sessions)

---

## Jak spustit projekt

```powershell
cd gym-tracker\gymtracker
npx expo start

# Type check
npx tsc --noEmit
```

### První spuštění na novém PC (pro Claude)

Pokud `gymtracker/.env` neexistuje (čerstvý clone), zeptej se uživatele na hodnoty a vytvoř soubor přes Edit tool (předloha v `.env.example`). Potřebuješ:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (jen pro seed skripty, ne pro app runtime)
- `EXPO_PUBLIC_USDA_API_KEY`

Pak spusť `npm install` v `gymtracker/`.

---

## Git

- Repo: https://github.com/Libords/gym-tracker
- Aktivní branch: `001-workout-ux-polish` (Sprint I, 6+ commitů, nemerged)
- Hlavní branch: `main`

---

## Jak pokračovat v nové konverzaci

1. Přečti tento soubor (CURRENT_HANDOFF.md)
2. Přečti PROJECT_PLAN.md — vyber první nezaškrtnutý bod z roadmapy nebo z "Možnosti dalšího sprintu" výše
3. Pro novou feature použij spec-kit: `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
