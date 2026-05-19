# DEV_DIARY.md — GymTracker Implementační log

Každý implementační krok zapisovat ve formátu:
`YYYY-MM-DD HH:MM — [Sprint X / popis] — OK / FAIL`

Při FAIL zapsat co selhalo a jak bylo opraveno.

---

## 2026-05-17

`2026-05-17 — Inicializace projektu — meta-soubory vytvořeny (CLAUDE.md, AGENTS.md, SECURITY.md, PROJECT_PLAN.md, DEV_DIARY.md, CURRENT_HANDOFF.md, .gitignore, .env.example) — OK`

---

## 2026-05-18

`2026-05-18 — Sprint A komplet — Expo projekt, Supabase, Auth flow (login/register/context), Expo Router, profil tabulka — OK`

`2026-05-18 — Sprint B komplet — DB schéma (workouts/exercises/workout_sets + RLS), seznam tréninků, nový trénink, výběr cviků, série, ukončení tréninku — OK`

`2026-05-18 — Sprint C komplet — DB schéma (meals/meal_items/food_database + RLS), denní přehled, přidání jídla, makra/kalorie, barcode scanner (Open Food Facts), USDA API klíč přidán — OK`

`2026-05-18 — Sprint D (bez fotek) — weight_logs + body_measurements DB + RLS, zadávání váhy, graf (react-native-svg), tělesné míry; fotky záměrně odstraněny — OK`

`2026-05-18 — Mikronutrienty (USDA FDC API) — rozšíření food_database o 18 mikro sloupců, MicronutrientsCard komponenta, enrichment OFF potravin, tab v Výživa — OK`

`2026-05-18 — Cyklus tracking — cycle_logs tabulka (+ is_partner sloupec), useCycleLogs(mode), 4 fáze cyklu s fázovou kalkulací, Progress tab Cyklus/Partnerka — OK`

`2026-05-18 — BMR/TDEE — src/lib/bmr.ts (Mifflin-St Jeor), calcTDEE (NEAT + trénink), calcSuggestedMacros, JOB_ACTIVITY_LABELS, TRAINING_TYPE_LABELS — OK`

`2026-05-18 — Onboarding wizard — 5 kroků (pohlaví/stats/job/trénink/TDEE), BMI live, onboarding_done flag, redirect guard — OK`

`2026-05-18 — Profile screen rewrite — full edit všech polí, recalc TDEE button, partner cycle switch (jen muži) — OK`

`2026-05-18 — Bottom tabs — Přehled/Tréninky/Výživa/Progress/Profil, Ionicons, hidden onboarding screen — OK`

`2026-05-18 — Dashboard — dynamické goals z profilu, weight delta, recent workouts, cycle phase chip, cycle tips card — OK`

`2026-05-18 — Partner cycle — PARTNER_PERSPECTIVE data pro 4 fáze, PartnerSupportSection (mood/tips/aktivity/avoid), Progress tab pro muže — OK`

`2026-05-18 — Commit + push: feat: onboarding wizard, BMR/TDEE, bottom tabs, partner cycle tracking — OK`

`2026-05-18 — SQL migrace pro uživatele — profiles (gender/birth_year/weight/job_activity/training_*/calorie_goal/macro_goals/has_partner_cycle/onboarding_done) + cycle_logs (is_partner) — připraveno, uživatel spustil — OK`

`2026-05-18 — spec-kit instalace — uv tool install specify-cli v0.8.11 + specify init gym-tracker --force --integration copilot — OK`

`2026-05-18 — Sprint H komplet — SQL migrace (exercises: body_part/equipment/category/target/secondary_muscles/instructions), seed import 873 cviků z free-exercise-db, useWorkoutSets join rozšířen, UI filtry + detail modal — OK`

---

## 2026-05-19 — Sprint I (Workout UX Polish)

`2026-05-19 — Sprint I spec — /speckit-specify + /speckit-clarify (Strong-style templates, kg/lb pref, US4 drop "Repeat last") — OK`

`2026-05-19 — Sprint I plan + tasks — research.md (9 R-otázek), data-model.md, contracts/ (db-schema.sql + 4 TS contracts), tasks.md (40 tasks v 7 fázích), /speckit-analyze pass — OK`

`2026-05-19 — Sprint I Phase 1 Setup (T001-T003) — npx expo install expo-notifications/expo-haptics/expo-av/react-native-draggable-flatlist/react-native-reanimated/react-native-gesture-handler, app.json plugin "expo-notifications", supabase/migrations/ folder — OK`

`2026-05-19 — Sprint I Phase 2 Foundational (T004-T011) — Supabase migrace 20260520_workout_templates_and_units.sql (workout_templates + template_exercises + profiles.default_rest_seconds/preferred_unit + workouts.template_id + RLS policies), aplikovaná uživatelem; types extension (WorkoutTemplate/TemplateExercise/Unit/EquipmentChip), units.ts (LB_PER_KG=2.20462), equipmentMapping.ts (8 canonical chipů), useUnitPreference hook, WeightInput komponenta, profile.tsx "Nastavení tréninku" sekce (kg/lb segmented + default_rest_seconds 5-600) — OK`

`2026-05-19 — Sprint I US1 Workout Templates (T012-T019) — useWorkoutTemplates: CRUD + reorderTemplateExercises (2-pass write s +10000 offset kvůli CHECK order_index >= 0) + startFromTemplate (LEFT JOIN exercises pro missingExerciseCount, batch INSERT workout_sets s předvyplněnými target hodnotami); TemplateCard, TemplateExerciseRow (chevron ▲/▼ fallback místo react-native-draggable-flatlist — RN 0.81/Reanimated 4 kompatibilní risk per research R3); templates/index s 3-action Alert pro rozpracovaný workout (per research R8); templates/[id] editor s auto-save názvu (debounced); workouts/index Šablony entry button; missing-exercise Alert po startFromTemplate — OK`

`2026-05-19 — Sprint I US2 Rest Timer (T020-T026) — notifications.ts (scheduleNotificationAsync TIME_INTERVAL trigger + cancel + permission API), restTimerStorage (AsyncStorage @gymtracker/restTimer s tvarovou validací), useRestTimer state machine (idle/running/paused/done, 500ms tick, mount-time cold-start restore, ensureNotificationPermission, +15 extend re-schedules, pause cancels, resume re-schedules, skip clears, reset re-starts, haptic Notification.Success na done); RestTimer komponenta (dark card s countdown m:ss, progress bar, +15 s/Pauza/Skip akce); _layout setupNotificationHandler v useEffect + GestureHandlerRootView wrapper; workouts/[id] integrace (po addSet auto-start, permission-denied Alert s Linking.openSettings, ref flag once-per-session). Pragmatické rozhodnutí: foreground sound řeší OS notification handler shouldPlaySound:true místo expo-av asset (žádný asset file potřeba) — OK`

`2026-05-19 — Sprint I US3 Historie tréninků (T027-T030) — useWorkoutHistory (paginated 30/page přes Supabase .range, JOIN workout_sets, JS-side aggregace total_volume_kg/set_count/exercise_count, groupByDay s localDateKey podle lokální TZ, loadMore signal); HistoryDayGroup karta s formatWeight v preferred_unit; history/index FlatList (initialNumToRender=15, windowSize=5, removeClippedSubviews, onEndReached); history/[id] detail (summary stats + per-cvik group s max weight + total volume); workouts/index Historie entry button — OK`

`2026-05-19 — Sprint I US4 Equipment filtr (T031-T033) — useExerciseFilters (session-only bodyPart/search/equipmentChips multi-select, applyFilters pure fn s mapEquipmentToChip, AND mezi všemi filtry); EquipmentChips horizontal scroll row 8 chipů s CS labely; integrace do obou pickerů (workouts/[id] + templates/[id]), resetFilters při zavření modalu — OK`

`2026-05-19 — Sprint I Polish (T034 tsc pass, T036 DEV_DIARY, T037 CURRENT_HANDOFF, T039 PROJECT_PLAN updated). ZBÝVÁ uživatel: T035 manual QA per quickstart.md na fyz. iOS+Android, T038 SC měření (rest timer notif latency, FPS historie, kg/lb propagace), T040 RLS verify ze second test accountu — OK (z mé strany)`
