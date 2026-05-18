# PROJECT_PLAN.md — GymTracker Roadmapa

Tento soubor je source of truth pro priority a pořadí implementace.
Vždy začni čtením tohoto souboru a vyber první nezaškrtnutý bod.

---

## Tech stack
- **Mobile**: Expo (React Native) + TypeScript + Expo Router
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: NativeWind (Tailwind CSS pro React Native) — rozhodnout v Sprint A
- **Testy**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions (lint + type check na PR), EAS Build pro produkci

---

## Sprint A — Základ

- [x] **A1** — Expo projekt inicializace (`npx create-expo-app --template expo-template-blank-typescript`)
- [x] **A2** — Supabase projekt vytvoření + `.env` konfigurace (URL + anon key)
- [x] **A3** — Supabase klient setup (`@supabase/supabase-js` + `AsyncStorage` pro session)
- [x] **A4** — Expo Router setup (file-based routing, `app/` složka)
- [x] **A5** — Auth flow: Login obrazovka (email + heslo)
- [x] **A6** — Auth flow: Register obrazovka
- [x] **A7** — Auth context / hook (`useAuth`) + protected routes
- [x] **A8** — Profil uživatele (jméno, věk, výška, cílová váha) — DB tabulka + RLS + obrazovka

---

## Sprint B — Záznamy tréninků

- [ ] **B1** — DB schéma: `workouts`, `exercises`, `workout_sets` + RLS policies
- [ ] **B2** — Seznam tréninků (prázdný stav + karta tréninku)
- [ ] **B3** — Nový trénink: výběr cviků (search + přidání)
- [ ] **B4** — Detail tréninku: přidání sérií (počet opakování, váha, čas odpočinku)
- [ ] **B5** — Ukončení tréninku (shrnutí + uložení)
- [ ] **B6** — Historie tréninků (seskupení po dnech)

---

## Sprint C — Jídelníček

- [ ] **C1** — DB schéma: `meals`, `meal_items`, `food_database` + RLS
- [ ] **C2** — Denní přehled jídelníčku (snídaně / oběd / večeře / svačiny)
- [ ] **C3** — Přidání jídla (vyhledávání v `food_database`)
- [ ] **C4** — Makra a kalorie — denní souhrn (proteiny, sacharidy, tuky, kcal)
- [ ] **C5** — Vlastní potraviny (uživatel přidá vlastní položku do `food_database`)

---

## Sprint D — Progress tracker

- [ ] **D1** — DB schéma: `weight_logs`, `body_measurements` + RLS
- [ ] **D2** — Zadávání váhy (datum + hodnota + poznámka)
- [ ] **D3** — Graf vývoje váhy (Victory Native nebo react-native-svg)
- [ ] **D4** — Tělesné míry (obvod hrudníku, pasu, boků, paže, stehna)
- [ ] **D5** — Fotky progresu (Expo ImagePicker + Supabase Storage)

---

## Sprint E — Dashboard a přehledy

- [ ] **E1** — Domovský dashboard (týdenní souhrn: tréninky, kalorie, váha)
- [ ] **E2** — Přehledy tréninků (nejlepší výkony, volume, frekvence)
- [ ] **E3** — Přehledy výživy (průměrné makro hodnoty za týden/měsíc)
- [ ] **E4** — Export dat (CSV)

---

## Sprint F — UX polish

- [ ] **F1** — Tmavý / světlý motiv
- [ ] **F2** — Onboarding wizard (první spuštění — profil + cíle)
- [ ] **F3** — Push notifikace (připomínka tréninku, zadání jídla)
- [ ] **F4** — Offline podpora (Expo SQLite local cache + sync při obnovení připojení)

---

## Backlog (neplánováno, nízká priorita)

- AI doporučení tréninků a stravy (Anthropic Claude)
- Předpřipravené tréninkové plány (šablony)
- Sdílení výsledků / social funkce
- Apple Health / Google Fit integrace
- Widget pro domovskou obrazovku
- Apple Watch / WearOS podpora
- Subscription / monetizace

---

## Hotové sprinty
- ✅ **Sprint A** — Základ (2026-05-18)
