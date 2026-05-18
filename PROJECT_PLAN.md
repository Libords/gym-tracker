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

## Sprint H — Exercise Database 🔜 NEXT

- [ ] **H1** — SQL migrace: rozšíření tabulky `exercises` (body_part, equipment, category, secondary_muscles, instructions, target)
- [ ] **H2** — Seed skript: import 800+ cviků z free-exercise-db (github.com/yuhonas/free-exercise-db)
- [ ] **H3** — TypeScript typy: rozšíření `Exercise` v `src/types/workout.ts`
- [ ] **H4** — Hook update: `useWorkouts.ts` — filtrování podle body_part / equipment
- [ ] **H5** — UI výběru cviků: filtry (partie + vybavení), detail cviku s instrukcemi

---

## Backlog

- [ ] B6 — Historie tréninků po dnech
- [ ] E2–E4 — Přehledy a export
- [ ] F3 — Push notifikace
- [ ] F4 — Offline podpora
- Sdílení výsledků / social funkce (propojení partnerských účtů)
- AI doporučení tréninků a stravy
- Apple Health / Google Fit integrace
- Předpřipravené tréninkové plány

---

## Hotové sprinty
- ✅ **Sprint A** — Základ
- ✅ **Sprint B** — Tréninky (bez B6)
- ✅ **Sprint C** — Jídelníček + mikronutrienty
- ✅ **Sprint D** — Progress (bez fotek)
- ✅ **Sprint E1** — Dashboard
- ✅ **Sprint F1+F2** — Tabs + Onboarding
- ✅ **Sprint G** — BMR/TDEE + Cyklus
