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

**Sprint H — Exercise Database ✅ HOTOVO** (873 cviků importováno z free-exercise-db).

**Další: Sprint I — Workout UX Polish** (viz PROJECT_PLAN.md, sekce "Doporučené pořadí dalších sprintů").

Stručně: historie tréninků (B6) + workout templates + rest timer + opakování posledního tréninku + equipment filtr. Cíl: app použitelná denně bez třenic.

**Start v nové session:**
```
/speckit.specify "Workout UX polish — Sprint I: historie tréninků po dnech, workout templates (uložené rutiny), rest timer mezi sériemi, opakování posledního tréninku, equipment filtr v exercise picker. Cíl: app použitelná denně bez třenic."
```

Pak: `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Strategická roadmapa (Sprint I → J → K → L) je v PROJECT_PLAN.md.

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
- Branch: main
- Poslední commit: `feat: onboarding wizard, BMR/TDEE, bottom tabs, partner cycle tracking`

---

## Jak pokračovat v nové konverzaci

1. Přečti tento soubor (CURRENT_HANDOFF.md)
2. Přečti PROJECT_PLAN.md — vyber první nezaškrtnutý bod z roadmapy nebo z "Možnosti dalšího sprintu" výše
3. Pro novou feature použij spec-kit: `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
