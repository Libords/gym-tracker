# PROJECT_PLAN.md — GymTracker Roadmapa

Tento soubor je source of truth pro priority a pořadí implementace.
Vždy začni čtením tohoto souboru a vyber první nezaškrtnutý bod.

---

## Tech stack
- **Mobile**: Expo SDK 54 (React Native) + TypeScript + Expo Router v3
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: StyleSheet.create (NativeWind zamítnuto)
- **Icons**: @expo/vector-icons (Ionicons)
- **Testy**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions (lint + type check na PR), EAS Build pro produkci
- **Spec-driven dev**: spec-kit v0.8.11 (slash commandy /speckit.*)

---

## Sprint A — Základ ✅

- [x] **A1** — Expo projekt inicializace
- [x] **A2** — Supabase projekt + `.env` konfigurace
- [x] **A3** — Supabase klient setup
- [x] **A4** — Expo Router setup
- [x] **A5** — Auth flow: Login
- [x] **A6** — Auth flow: Register
- [x] **A7** — Auth context / hook (`useAuth`) + protected routes
- [x] **A8** — Profil uživatele — DB tabulka + RLS + obrazovka

---

## Sprint B — Záznamy tréninků ✅

- [x] **B1** — DB schéma: `workouts`, `exercises`, `workout_sets` + RLS
- [x] **B2** — Seznam tréninků (prázdný stav + karta tréninku)
- [x] **B3** — Nový trénink: výběr cviků (search + přidání)
- [x] **B4** — Detail tréninku: série (reps, váha, rest)
- [x] **B5** — Ukončení tréninku (shrnutí + uložení)
- [ ] **B6** — Historie tréninků (seskupení po dnech) ← TODO

---

## Sprint C — Jídelníček ✅

- [x] **C1** — DB schéma: `meals`, `meal_items`, `food_database` + RLS
- [x] **C2** — Denní přehled (snídaně/oběd/večeře/svačina) + makra
- [x] **C3** — Přidání jídla: Open Food Facts API + barcode scanner
- [x] **C4** — Makra a kalorie — denní souhrn + progress bary
- [x] **C5** — USDA FDC integrace: 18 mikronutrientů, MicronutrientsCard, % DDD
- [x] **C6** — Dynamické cíle z profilu (ne hardcoded)

---

## Sprint D — Progress tracker ✅ (fotky záměrně vynechány)

- [x] **D1** — DB schéma: `weight_logs`, `body_measurements` + RLS
- [x] **D2** — Zadávání váhy (datum + hodnota)
- [x] **D3** — Graf vývoje váhy (react-native-svg)
- [x] **D4** — Tělesné míry (hrudník, pas, boky, paže, stehno)
- [x] **D5** — ~~Fotky progresu~~ — záměrně odstraněno, uživatelé mají foto v galerii

---

## Sprint E — Dashboard ✅ (část)

- [x] **E1** — Dashboard: kalorie dnes, váha + delta, poslední tréninky, cycle chip
- [ ] **E2** — Přehledy tréninků (PR, volume, frekvence)
- [ ] **E3** — Přehledy výživy (průměry za týden/měsíc)
- [ ] **E4** — Export dat (CSV)

---

## Sprint F — UX & Onboarding ✅ (část)

- [x] **F1** — Bottom tab navigace (5 tabů, Ionicons)
- [x] **F2** — Onboarding wizard (5 kroků, BMR/TDEE, onboarding_done flag)
- [ ] **F3** — Push notifikace (Expo Notifications — připomínka tréninku/jídla)
- [ ] **F4** — Offline podpora

---

## Sprint G — Biologické funkce ✅

- [x] **G1** — BMR/TDEE kalkulace (Mifflin-St Jeor, NEAT, tréninkové kalorie)
- [x] **G2** — Profile screen: edit stats, recalc TDEE, macro goals
- [x] **G3** — Cyklus tracking: 4 fáze, fázová kalkulace, tréninkové + výživové tipy
- [x] **G4** — Partner cycle: PARTNER_PERSPECTIVE data, PartnerSupportSection (mood/tipy/aktivity)

---

## Sprint H — Exercise Database ✅

- [x] **H1** — SQL migrace: rozšíření tabulky `exercises` (body_part, equipment, category, secondary_muscles, instructions, target)
- [x] **H2** — Seed skript: import 873 cviků z free-exercise-db (github.com/yuhonas/free-exercise-db)
- [x] **H3** — TypeScript typy: rozšíření `Exercise` v `src/types/workout.ts`
- [x] **H4** — Hook update: `useWorkouts.ts` — join rozšířen o target/equipment/body_part
- [x] **H5** — UI výběru cviků: filtry (partie), detail cviku s instrukcemi

---

## Doporučené pořadí dalších sprintů

Pořadí je voleno podle **value/effort ratio** — co dává největší užitek uživateli s nejmenším úsilím.

| # | Sprint | Proč teď | Effort |
|---|--------|----------|--------|
| 1 | **Sprint I** — Workout UX Polish | UX díry: žádná historie, žádné šablony, žádný rest timer. Bez tohoto app není použitelná denně. | 3-5 sessions |
| 2 | **Sprint J** — Statistics & Insights | Uživatel právě naimportoval 873 cviků + má 2 měsíce dat → čas mu ukázat trendy. | 3-4 sessions |
| 3 | **Sprint K** — Data & Reliability | Export, notifikace, backup — důvěra v app pro daily use. | 2-3 sessions |
| 4 | **Sprint L** — Premium features | Offline mode, Apple Health, AI — větší investice, počká si. | 4-6+ sessions |

---

## Sprint I — Workout UX Polish ✅ (kód hotov, čeká na device QA)

Cíl: doplnit "obvyklé" funkce každé fitness app (Strong, Hevy, FitBod), aby byla použitelná denně.

- [x] **I1** — Historie tréninků (B6): paginated list (30/page) seskupený po dnech, detail per cvik se sériemi + total volume
- [x] **I2** — Workout templates: Strong-style šablony s target sets/reps/weight, 1-click start, missing-exercise toast, dialog pro rozpracovaný workout
- [x] **I3** — Rest timer: setInterval countdown + scheduled expo-notifications, AsyncStorage cold-start restore, +15/Pauza/Skip, permission-denied dialog
- [x] **I4** — "Repeat last" — sloučeno do I2 (templates-lite per spec clarification)
- [x] **I5** — Equipment filtr v exercise pickeru: 8 chipů (Činka/Osa/Kabel/Stroj/Vlastní váha/Kettlebell/Bands/Žádné) multi-select, AND s body_part
- [x] **I-bonus** — `preferred_unit` kg/lb na profilu, display layer conversion, `default_rest_seconds` configurable

**Branch:** `001-workout-ux-polish` (40 tasků commitnutých po fázích)
**Čeká na:** manual QA per [specs/001-workout-ux-polish/quickstart.md](specs/001-workout-ux-polish/quickstart.md) na fyz. iOS + Android, SC měření (T035 + T038)

---

## Sprint J — Statistics & Insights

Cíl: ukázat uživateli pokrok pomocí dat, která má app k dispozici (873 cviků × 2 měsíce záznamů).

- [ ] **J1** — Personal Records per exercise: max weight × reps, graf progrese (line chart), PR badge při překonání
- [ ] **J2** — Volume tracking: total volume (kg × reps) per partie tela týden/měsíc, bar chart trendu
- [ ] **J3** — Frequency heatmap: kalendář tréninkových dnů (GitHub-contributions style), počet/intenzita
- [ ] **J4** — Nutrition trends (E3): týdenní/měsíční průměry kalorií, makra adherence (% dosažení cílů)
- [ ] **J5** — Weight trend: rozšíření existujícího weight grafu o trend line + delta vs cíl

**Klíčové soubory:** `app/(app)/stats/` (nová sekce s tabbar tabs), `src/lib/stats.ts` (kalkulace), reuse `react-native-svg` (už v projektu z D3).

**Spec-kit start prompt:**
```
/speckit.specify "Statistics & Insights — Sprint J: personal records per exercise (max weight × reps + graf), volume tracking po partiích, frequency heatmap kalendář tréninkových dnů, nutrition trends (týdenní průměry + macro adherence). Vstup: workouts/workout_sets/meals/weight_logs tabulky."
```

---

## Sprint K — Data & Reliability

Cíl: důvěra v app pro daily use — uživatel může exportovat data, je notifikován, nezapomene.

- [ ] **K1** — Export CSV: workouts/sets/meals/weight/measurements do CSV (Expo FileSystem + Sharing API)
- [ ] **K2** — Push notifications (F3): workout reminder podle training_days_per_week, meal log reminder ráno/večer (Expo Notifications)
- [ ] **K3** — Backup/Import: JSON export celé user DB + import (re-import po reinstalu app)

**Klíčové soubory:** `src/lib/export.ts`, `src/lib/notifications.ts`, `app/(app)/settings/export.tsx`.

**Spec-kit start prompt:**
```
/speckit.specify "Data & Reliability — Sprint K: CSV export všech dat (workouts/meals/weight) přes Share Sheet, push notifikace pro připomínky tréninku a jídla podle profilu, JSON backup/import celé user DB."
```

---

## Sprint L — Premium Features (budoucí)

Větší investice, počkat až bude solidní base.

- [ ] **L1** — Offline mode (F4): Supabase realtime + local SQLite cache (expo-sqlite), sync on reconnect
- [ ] **L2** — Apple Health / Google Fit: import weight/workouts, export workouts (react-native-health)
- [ ] **L3** — AI doporučení: workout suggestions na základě historie + cílů, meal suggestions (Anthropic API)
- [ ] **L4** — Social: propojení partnerských účtů (cycle), sdílení PR, friend feed
- [ ] **L5** — Předpřipravené tréninkové plány: PPL, 5×5, Push/Pull, Upper/Lower (jako built-in templates)

---

## Workflow pro každý sprint

1. Otevři novou session
2. Spusť spec-kit prompt z dané sekce (`/speckit.specify`)
3. Pokračuj `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
4. Po dokončení: aktualizuj zaškrtnutí, DEV_DIARY.md, CURRENT_HANDOFF.md, commit + push

---

## Hotové sprinty
- ✅ **Sprint A** — Základ
- ✅ **Sprint B** — Tréninky (bez B6)
- ✅ **Sprint C** — Jídelníček + mikronutrienty
- ✅ **Sprint D** — Progress (bez fotek)
- ✅ **Sprint E1** — Dashboard
- ✅ **Sprint F1+F2** — Tabs + Onboarding
- ✅ **Sprint G** — BMR/TDEE + Cyklus
- ✅ **Sprint H** — Exercise Database (873 cviků)
