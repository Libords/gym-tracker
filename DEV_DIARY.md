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

`2026-05-19 (Mac, večer) — Setup pro device testing na iOS přes Expo Go + tunnel: npm install --legacy-peer-deps (47 new pkg z feature větve), npx expo install @expo/ngrok lokálně, fixed runtime crashes: (1) react-native-worklets@0.5.1 — chyběl jako peer dep pro reanimated@4 (Sprint I ho zapomněl přidat), (2) @react-native-async-storage/async-storage downgrade 3.0.2 → 2.2.0 — Expo Go SDK 54 binary nemá native modul pro v3 (Native module is null crash v @supabase/auth-js GoTrueClient), (3) Migrace expo-barcode-scanner → expo-camera CameraView API v17 — deprecated v SDK 51+, odebrán z Expo Go SDK 54 (Cannot find native module 'ExpoBarCodeScanner' crash). app.json: odebrán plugin expo-barcode-scanner, přidán expo-camera s českým cameraPermission textem. add-food.tsx: useCameraPermissions hook místo BarCodeScanner.requestPermissionsAsync, CameraView s barcodeScannerSettings.barcodeTypes (ean13/ean8/upc_a/upc_e/code128/code39). tsc pass. ZBÝVÁ: ověřit na telefonu po restartu Expo Go (kill + reopen kvůli cache) — OK`


## 2026-05-22

`2026-05-22 — Device testing iniciální průchod — Expo Go (tunnel) na iOS, příprava na T035. Bug fixes během testování: (1) register.tsx — vždy ukazoval alert "Zkontroluj email" i když Supabase má email confirmation vypnutý a vrátil session; nyní check data.session → skip alert, (2) onboarding.tsx + profile.tsx — text "Kolikrát týdně tréninuješ?" → "Kolik dní v týdnu trénuješ?" (max 7 dává smysl s touto formulací), odstraněn překlep tréninuješ→trénuješ a × suffix u stepperu. Memory updates: feedback_nutrition_messaging.md (disclaimer, surplus claims, zdroje maker), project_feature_decisions.md (Phase 2: protein per goal, diet preferences, science disclaimer), project_monetization.md (one-time fees za migrace/export, reklamy ve free, owner unlocked). VISIONS.md sekce 16: UX redesign, Onboarding 2.0, bugy bílá dashboard + nepředvyplněný profil, partner cycle pro ženy. tsc pass. ZBÝVÁ pro další session: oprava bug 16.5 (bílá dashboard + nepředvyplněný profil), pokračovat T035/T038/T040 — OK (commit + push)`

`2026-05-22 — VISIONS 16.2 Onboarding 2.0 nutrition messaging — bmr.ts: nový type Goal (cut/maintenance/bulk) + inferGoal(current,target) s ±2 kg threshold (vyhne se DB migraci), PROTEIN_PER_KG{cut:2.2, maint:1.8, bulk:1.7} v rámci ISSN 1.6–2.2, FAT_PCT 25 % (Helms et al. min pro hormonální zdraví), calcSuggestedMacros nyní bere goal parametr. onboarding.tsx Step 5: softer surplus messaging ("nabírat jde i v maintenance"), warning při kcal < BMR (žluto-oranžový card), TDEE jako průměrný denní výdej (vícedenní bázi), goal chip podle inferGoal, source card s vysvětlením odkud čísla pocházejí, science disclaimer card. profile.tsx: recalcTDEE propaguje inferGoal do maker, Alert ukazuje cíl + reminder o vícedenní bázi, disclaimer pod sekcí maker. Žádné DB změny, žádné nové deps. tsc pass — OK`

`2026-05-22 — BMI disclaimer v onboardingu — Step2Stats pod BMI chip přidán krátký disclaimer (sval váží víc než tuk, silově trénující lidé můžou vyjít jako "nadváha", odkaz na Progress tab pro relevantnější míry/trend/vzhled). Číslo + kategorie zůstávají (user volba "nechat vše + disclaimer"). tsc pass — OK`

`2026-05-22 — VISIONS 16.6 fáze 1: Cycle privacy redesign — supabase/migrations/20260522_cycle_visibility.sql (ADD profiles.cycle_tracking_enabled BOOL DEFAULT FALSE NOT NULL + backfill TRUE pro ženy s existujícími cycle_logs.is_partner=false), useProfile Profile type rozšířen. profile.tsx: pryč mužův toggle "Cyklus partnerky" + has_partner_cycle state, místo toho ženský toggle pod sekcí "Soukromí" (záměrně dole pro diskrétnost). progress/index.tsx: showCycleTab = female AND cycle_tracking_enabled, odstraněna Partnerka záložka pro muže (PartnerSupportSection function v souboru zůstává — bude recyklována při edukativním hubu). dashboard index.tsx: odstraněn cycleMode='partner', cycle chip jen pro ženy s opt-in. has_partner_cycle a cycle_logs.is_partner rows ponechány v DB (žádné destruktivní mazání) — pro budoucí couple linking (15.5). VISIONS 16.6 aktualizována s odloženou edukativní záložkou. tsc pass. ZBÝVÁ uživatel: aplikovat SQL migraci v Supabase — OK (z mé strany)`

`2026-05-22 — VISIONS 16.5 bug fixes (dashboard bílá obrazovka + profil nepředvyplněn) + nutrition wording tweaks — useProfile.ts přepsán: odstraněn synthesized fallback profile (návrat null místo defaults s onboarding_done=false → způsoboval blank dashboard + reset form fields), updateProfile nyní chainuje .select().single() po upsert pro canonical DB row místo merge {...prev, ...updates}, fetchProfile vrácen jako refetch callback, error logging console.error pro device debug, fetch používá maybeSingle místo single (nevyhodí 406 na chybějícím row). onboarding.tsx handleFinish: check error z updateProfile + Alert "Nepodařilo se uložit profil" + abort navigation při fail (dříve tiše propadlo). dashboard index.tsx: redirect na onboarding pro pLoading=false + (profile=null OR !onboarding_done), blank screen guard rozšířen. Nutrition tweaky: (1) calorieHint rozdělen "Nabírání" na hmotnost (surplus potřebný) vs sval (surplus podmínkou není, recomp v maintenance i mírném deficitu), (2) source card přepsán — tuky doplněno o WHO/AMDR rozsah 20–35 % a poznámku že jiný styl (lowcarb/keto) lze v profilu, sacharidy už neodkazují na "výkon v posilovně" (appka pro broader audience včetně lidí co necvičí) — místo toho generické "zbytek kalorického cíle, pro většinu hlavní zdroj energie". tsc pass — OK`

`2026-05-22 — Safe area fix + VISIONS 16.1 spec finalize — content na všech top-level screens se překrýval s Dynamic Island / status barem (chybělo SafeAreaProvider + safe-area-context unused). app/_layout.tsx: SafeAreaProvider wrapnut kolem AuthProvider. Wrapper SafeAreaView edges=['top'] přidán do: index.tsx (dashboard), profile.tsx, progress/index.tsx, nutrition/index.tsx, workouts/index.tsx, onboarding.tsx. react-native-safe-area-context už byl v deps (~5.6.0). VISIONS 16.1 spec finalizována (drawer + per-mode bottom tabs max 5 button, hamburger top-left permanent, swipe-back navigation, drawer modes TBD ale obsahuje Domů/Trénink/Jídelníček/Progress/Profil/Vzdělávání) — připraveno pro Sprint J přes /speckit.specify. tsc pass — OK`

`2026-05-27 — ROOT CAUSE 16.5 nalezen na device: PostgreSQL 42501 "permission denied for table profiles". RLS policies existovaly, ale roli `authenticated` nikdy nebyl udělen baseline GRANT — RLS filtruje řádky, ale negranuje base privilege. Proto SELECT na profiles vždy selhal (blank dashboard, prázdný profil). Fix: supabase/migrations/20260522_profile_grants.sql (GRANT SELECT/INSERT/UPDATE na profiles + defenzivně DELETE na ostatní user-owned tabulky cycle_logs/workouts/workout_sets/templates/meals/meal_items/food_items/weight_logs/body_measurements + SELECT na exercises). ZBÝVÁ uživatel: aplikovat tuto migraci v Supabase SQL editoru. Druhý bug: 11 tabů v bottom baru (expo-router 6 táhl každý nested soubor jako tab) — fix: _layout.tsx Stack přidán do workouts/, nutrition/, progress/. User potvrdil že bottom bar teď vypadá líp. tsc pass — OK (z mé strany; čeká aplikace GRANT migrace)`

`2026-05-28 — 16.5 OVĚŘENO NA DEVICE = uzavřeno. User aplikoval obě migrace v Supabase (20260520 workout_templates — předtím nikdy neaplikovaná, odhaleno chybou 42P01; + 20260522_profile_grants — přepsána na defenzivní DO blok s to_regclass checkem, ať nespadne na chybějících tabulkách). GRANT migrace si vyžádala přepis: flat GRANT spadl na 42P01 (workout_templates neexistoval) → rollback celé transakce → i profiles GRANT se vrátil. Po aplikaci: registrace vytvoří přes trigger prázdný profiles řádek (onboarding_done=false, vše NULL), onboarding ho teď úspěšně UPDATEuje (dřív blokoval chybějící GRANT i přes správné RLS policies auth.uid()=id). Onboarding se drží, dashboard má obsah, profil předvyplněný, už se neptá opakovaně. Sprint I tím i plně funkční (workout_templates DB konečně existuje). commits: 8a9549e, 390ae7d. tsc pass — OK`

`2026-05-28 — Bug fix: exercise body_part filtr vracel 0 cviků u většiny partií (Hrudník 0, Záda 182). Root cause: seed-exercises.ts mapoval body_part z free-exercise-db `category` (= typ tréninku strength/cardio/stretching/…, NE svalová partie). Skoro vše skončilo jako body_part='strength'. Fix: nový src/lib/bodyParts.ts jako single source of truth (BODY_PARTS, BODY_PART_LABELS, muscleToBodyPart). body_part se nově odvozuje z muscle_group (=primaryMuscles[0]) přes coarse grouping (chest/back/shoulders/arms/legs/calves/abs/neck/other → CS Hrudník/Záda/Ramena/Paže/Nohy/Lýtka/Břicho/Krk/Ostatní). Migrace 20260528_fix_exercise_body_part.sql (UPDATE podle muscle_group CASE). workouts/[id].tsx + workouts/templates/[id].tsx: nahrazeny lokální duplikované BODY_PARTS importem z lib. seed-exercises.ts: categoryToBodyPart odstraněn, používá muscleToBodyPart(primaryMuscles[0]). VISIONS 16.9 (bug doc), 16.10 (exercise obrázky — free-exercise-db images[] pole, k implementaci), 16.11 (Strong-style per-set zadávání — větší redesign workout flow, reference screenshoty). ZBÝVÁ uživatel: aplikovat migraci 20260528. tsc pass — OK`

`2026-05-28 — VISIONS 16.10 exercise obrázky (1. iterace) — migrace 20260528_exercise_images.sql (ADD COLUMN exercises.image_url text). Exercise typ + image_url. Nová komponenta ExerciseThumbnail (RN Image, žádná nová dep; first-letter placeholder ve fallbacku při chybějícím/nenačteném obrázku, onError handling). Seed skript: image_url = IMAGE_BASE + e.images[0] (raw GitHub URL prefix). Thumbnaily integrovány do exercise pickeru v workouts/[id].tsx + workouts/templates/[id].tsx (size 44) a do detail-modalu cviku (size 140). exerciseItem style v templates sjednocen na flexDirection row. Upřesnění od usera: obrázky stačí v pickeru/výběru, ne v běžícím tréninku. ZBÝVÁ uživatel: aplikovat migraci 20260528_exercise_images.sql + re-run seed (npx ts-node scripts/seed-exercises.ts, vyžaduje SERVICE_ROLE_KEY) pro doplnění obrázků k 873 cvikům. tsc pass — OK`

`2026-05-28 — Seed re-run proveden + fix env loadingu. Seed skript přes ts-node neuměl načíst .env (Expo to dělá automaticky, samostatný skript ne) → "Chybí EXPO_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY". Fix: import 'dotenv/config' na začátek seed-exercises.ts (dotenv už transitivní dep). Migrace 20260528_exercise_images.sql aplikována uživatelem, seed úspěšně proběhl — 873 cviků upsertnuto s image_url (raw GitHub URL) + opravenými body_part. ZBÝVÁ: ověřit obrázky v appce po reloadu — OK`
