# Implementation Plan: Workout UX Polish (Sprint I)

**Branch**: `001-workout-ux-polish` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-workout-ux-polish/spec.md`

## Summary

Sprint I dodává čtyři viditelné UX vylepšení mobilní app GymTracker (Expo SDK 54 + Supabase): (1) Workout Templates ve Strong-stylu — uložené rutiny s target sets/reps/weight, ze kterých uživatel jedním tapem startuje den, (2) Rest Timer mezi sériemi s local push notifikací, vizuálem, zvukem a haptikou, persistovaný přes cold-start, (3) Historie tréninků seskupená po dnech s detailem, (4) Equipment filtr v exercise pickeru. Plus globální `preferred_unit` (kg/lb) na profilu uživatele se display-layer konverzí (DB zůstává canonical kg). Žádná změna stacku, žádné nové externí služby — staví výhradně na existujícím Supabase schématu + dodá 2 nové tabulky (`workout_templates`, `template_exercises`) a rozšíření `profiles` o 3 pole.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode), JSX/TSX přes Expo Router 6 file-based routing.

**Primary Dependencies**:
- Expo SDK ~54.0.33, React 19.1, React Native 0.81.5, Expo Router ~6.0.23
- @supabase/supabase-js ^2.105 (auth + Postgres REST + Realtime)
- @react-native-async-storage/async-storage ^3.0 (lokální persistence rest timeru)
- **NEW**: `expo-notifications` (local scheduled notifications), `expo-av` nebo `expo-audio` (sound), `expo-haptics` (vibrace)
- **NEW**: `react-native-draggable-flatlist` (DnD reorder cviků v šabloně) — fallback move up/down tlačítka pokud kompatibilita s RN 0.81/React 19 selže

**Storage**: Supabase Postgres (canonical state) + AsyncStorage (lokální ephemeral state pro rest timer).

**Testing**: TypeScript type-check (`npx tsc --noEmit`) jako primární gate. Manuální regression test plán v `quickstart.md`. Žádná unit-test infrastruktura v projektu zatím není; sprint **nezavádí** Jest/Detox (mimo scope).

**Target Platform**: iOS 15+ a Android 8+ (Expo Go pro dev, EAS Build pro produkci). Web target nepodporován pro Sprint I (rest timer + push notifikace jsou mobile-only).

**Project Type**: Mobile-app (Expo subproject v `gymtracker/`) + Supabase backend (managed, schema-as-migration).

**Performance Goals**:
- Historie: 200 workoutů v seznamu < 1 s, scroll FPS ≥ 55 (FlatList + windowSize tuning)
- Rest timer: notifikace do 1 s od skutečného uplynutí (FR / SC-002)
- Spuštění z šablony: < 5 s od tapu po první sérii k zápisu (SC-001)
- Změna `preferred_unit`: < 500 ms propagace napříč UI (SC-008)

**Constraints**:
- Offline-friendly read (FR-052) — historie a šablony musí jít otevřít bez sítě (Supabase JS klient cachuje session, ale data ne; pro Sprint I je minimální cache stav přijatelný — žádné full offline write)
- RLS na všech nových tabulkách (FR-051) — `auth.uid() = user_id` policy
- Žádné premium gating, žádné limity počtu šablon (FR-006)
- DB schema držet kg jako canonical jednotku (FR-009, SC-008)

**Scale/Scope**:
- Cílový uživatel: < 1 000 active users v MVP fázi
- DB: pravděpodobně < 50 šablon × cviků per user, < 500 dokončených workoutů per user / rok
- UI: 4 nové screens (templates list, template editor, history list, history detail) + úprava 3 existujících (workout detail pro rest timer, exercise picker pro equipment chipy, profile/settings pro preferred_unit + default rest)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution soubor (`.specify/memory/constitution.md`) je v projektu pouze prázdný template (placeholdery `[PRINCIPLE_X_NAME]`, žádná ratifikovaná pravidla). **Žádné konkrétní gates k vyhodnocení.** Aplikované de-facto principy z `CLAUDE.md` / `AGENTS.md` projektu:

| De-facto pravidlo | Status |
|---|---|
| Čeština UI, EN kód a commity | ✅ Plán respektuje (FR-050) |
| TypeScript only, žádný `.js` v `src/` | ✅ Žádné nové `.js` soubory |
| Conventional Commits | ✅ Bude dodrženo v `/speckit-implement` fázi |
| `npm install` vyžaduje schválení | ⚠️ 3 nové závislosti (`expo-notifications`, `expo-haptics`, `expo-av`/`expo-audio`, `react-native-draggable-flatlist`) — uživatel schválí jednorázově při startu Phase 2 |
| Supabase migrace vyžadují schválení | ⚠️ 1 nová migrace (2 tabulky + ALTER profiles) — uživatel schválí před aplikací |
| Žádný broken build v gitu | ✅ `tsc --noEmit` v každém commitu |

**Verdikt**: PASS — žádné hard violations. Dvě měkká pravidla (`npm install`, supabase migrace) vyžadují one-time user approval v `/speckit-implement` fázi; konzistentní s existujícím workflow projektu, neporušuje konstituci.

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-ux-polish/
├── plan.md              # This file
├── research.md          # Phase 0 — knihovny, DnD, notifikace, equipment mapping
├── data-model.md        # Phase 1 — entity, schema migrace, RLS policies
├── quickstart.md        # Phase 1 — manuální test plán per US
├── contracts/           # Phase 1 — Supabase tabulkové smlouvy + UI typed signatures
│   ├── db-schema.sql        # CREATE TABLE + RLS policies (autoritativní SQL)
│   ├── workout-templates.ts # TS typy + hook signatures (useWorkoutTemplates, ...)
│   ├── rest-timer.ts        # TS typy + hook signatures (useRestTimer)
│   └── equipment-facets.ts  # Mapping config + TS typy
├── spec.md              # Feature spec (input)
└── tasks.md             # Phase 2 (/speckit-tasks) — NOT created here
```

### Source Code (repository root)

```text
gym-tracker/                              # repo root
├── gymtracker/                           # Expo subproject (RN app)
│   ├── app/                              # expo-router screens
│   │   └── (app)/
│   │       ├── workouts/
│   │       │   ├── index.tsx             # 🔧 doplnit "Spustit z šablony" entry + access to templates
│   │       │   ├── [id].tsx              # 🔧 integrovat <RestTimer/> nad další sérií
│   │       │   ├── templates/            # 🆕 nová sekce
│   │       │   │   ├── index.tsx         # 🆕 seznam šablon (US1)
│   │       │   │   └── [id].tsx          # 🆕 editor šablony (drag&drop, target hodnoty)
│   │       │   └── history/              # 🆕 nová sekce (US3)
│   │       │       ├── index.tsx         # 🆕 historie seskupená po dnech
│   │       │       └── [id].tsx          # 🆕 detail tréninku
│   │       └── profile.tsx               # 🔧 přidat preferred_unit picker + default rest seconds
│   ├── src/
│   │   ├── components/
│   │   │   ├── workouts/                 # 🆕 doménová subfolder (refactor)
│   │   │   │   ├── RestTimer.tsx         # 🆕 vizuál + ovládání countdownu
│   │   │   │   ├── TemplateCard.tsx      # 🆕
│   │   │   │   ├── TemplateExerciseRow.tsx # 🆕 (target inputs + DnD handle)
│   │   │   │   ├── EquipmentChips.tsx    # 🆕 multi-select equipment filter
│   │   │   │   ├── HistoryDayGroup.tsx   # 🆕 sekce historie po dnech
│   │   │   │   └── WeightInput.tsx       # 🆕 reusable input s kg/lb display layer
│   │   ├── hooks/
│   │   │   ├── useWorkouts.ts            # 🔧 doplnit createWorkoutFromTemplate(templateId)
│   │   │   ├── useWorkoutTemplates.ts    # 🆕 CRUD šablon + template_exercises
│   │   │   ├── useRestTimer.ts           # 🆕 state machine + AsyncStorage persistence + scheduled notification
│   │   │   ├── useWorkoutHistory.ts      # 🆕 paginated query, day grouping
│   │   │   ├── useExerciseFilters.ts     # 🆕 muscle_group + equipment multi-select
│   │   │   └── useUnitPreference.ts      # 🆕 thin selector nad useProfile().profile.preferred_unit
│   │   ├── lib/
│   │   │   ├── equipmentMapping.ts       # 🆕 raw equipment → canonical chip (8 kategorií)
│   │   │   ├── units.ts                  # 🆕 kgToLb / lbToKg / formatWeight(unit)
│   │   │   ├── restTimerStorage.ts       # 🆕 AsyncStorage wrapper (load/save/clear timer state)
│   │   │   ├── notifications.ts          # 🆕 setup, permissions, scheduleRestDoneNotification, cancelById
│   │   │   └── supabase.ts               # existing
│   │   ├── types/
│   │   │   └── workout.ts                # 🔧 doplnit WorkoutTemplate, TemplateExercise, RestTimerState, EquipmentChip
│   │   └── context/
│   │       └── AuthContext.tsx           # existing — beze změny
│   └── package.json                      # 🔧 nové deps (vyžaduje user approval)
└── supabase/                             # 🆕 (pokud ještě neexistuje — viz research.md)
    └── migrations/
        └── 20260520_workout_templates_and_units.sql  # 🆕 contracts/db-schema.sql sem překopírovat
```

**Structure Decision**: Pokračujeme s existující mobile-app strukturou: Expo subproject `gymtracker/` drží veškerý frontend kód (RN/TS), Supabase migrace žijí v `supabase/migrations/` v root repa. Žádná nová "Option" — Sprint I rozšiřuje existující rozložení o doménové subfolder pro workout-feature komponenty (`src/components/workouts/`) a 4 nové hooks (`useWorkoutTemplates`, `useRestTimer`, `useWorkoutHistory`, `useUnitPreference`). Migrace je single-file přidávající 2 tabulky a 3 sloupce do `profiles`; backwards-compatible (default hodnoty pokrývají existující uživatele).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Žádné Constitution violations — sekce nepoužita.
