---

description: "Tasks: Workout UX Polish (Sprint I)"
---

# Tasks: Workout UX Polish (Sprint I)

**Input**: Design documents from `/specs/001-workout-ux-polish/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Projekt nemá Jest/Detox infrastrukturu; sprint **ji nezavádí** (per plan.md). Automated test tasks jsou tedy **vynechány**. Validace probíhá manuálně přes [quickstart.md](./quickstart.md) a TypeScript-check (`npx tsc --noEmit`). Pokud později budeš chtít přidat unit testy, doplň je v separátním sprintu.

**Organization**: Tasks jsou seskupeny podle User Stories ze [spec.md](./spec.md) tak, aby každá US šla implementovat a otestovat nezávisle. US1+US2 jsou P1 (MVP). US3 je P2. US4 je P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Lze pustit paralelně (různé soubory, žádné nedokončené závislosti)
- **[Story]**: US1 / US2 / US3 / US4 podle spec.md
- Cesty: kde není uvedeno jinak, jsou relativní k repo rootu `gym-tracker/`. App kód žije v `gymtracker/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Účel**: Instalace nových závislostí a příprava folder struktury podle plan.md.

- [ ] T001 Schválit a nainstalovat nové npm závislosti v `gymtracker/`: `expo-notifications`, `expo-haptics`, `expo-av` (nebo `expo-audio` per SDK 54 doc), `react-native-draggable-flatlist`. Spustit `npx expo install <pkg>` (NE `npm install`) aby Expo zvolil verze kompatibilní s SDK 54. Aktualizuje `gymtracker/package.json` + lockfile.
- [ ] T002 [P] Vytvořit doménový folder `gymtracker/src/components/workouts/` (zatím prázdný; bude obsahovat RestTimer.tsx, TemplateCard.tsx, TemplateExerciseRow.tsx, EquipmentChips.tsx, HistoryDayGroup.tsx, WeightInput.tsx).
- [ ] T003 [P] Vytvořit folder `supabase/migrations/` v repo rootu, pokud zatím neexistuje. Připravit prázdný `.gitkeep` pokud žádné existující migrace nejsou.

**Checkpoint**: Závislosti nainstalovány, struktura připravena. Bez T001 nelze začít s US2 (notifikace) ani US1 (DnD).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Účel**: Sdílený základ pro **všechny** User Stories — DB schema, TS typy, kg/lb display layer, equipment mapping, profile rozšíření.

**⚠️ CRITICAL**: Žádná US nemůže začít, dokud není tato fáze hotová. Migrace a `units.ts` jsou používány napříč US1/US2/US3.

- [ ] T004 Zkopírovat [`specs/001-workout-ux-polish/contracts/db-schema.sql`](./contracts/db-schema.sql) do `supabase/migrations/20260520_workout_templates_and_units.sql`. **Schválit s uživatelem** (per CLAUDE.md projektu — Supabase migrace vyžadují approval), pak aplikovat v Supabase Studio SQL editoru nebo přes `supabase db push`. Ověřit `\d workout_templates`, `\d template_exercises`, `\d profiles`, `\d workouts`.
- [ ] T005 [P] Rozšířit TS typy v `gymtracker/src/types/workout.ts` o `WorkoutTemplate`, `TemplateExercise`, `Unit` a doplnit `template_id: string | null` do typu `Workout`. Importovat strukturu z `specs/001-workout-ux-polish/contracts/_shared-types.ts` + `workout-templates.ts` (pouze typy, ne re-export contracts).
- [ ] T006 [P] Rozšířit typ `Profile` v `gymtracker/src/hooks/useProfile.ts` o `default_rest_seconds: number` a `preferred_unit: 'kg' | 'lb'`; v defaultním fallback objektu nastavit `default_rest_seconds: 90`, `preferred_unit: 'kg'`.
- [ ] T007 [P] Vytvořit `gymtracker/src/lib/units.ts` s exportovanými pure funkcemi `kgToLb(kg)`, `lbToKg(lb)`, `formatWeight(kg, unit, opts?)`. Konstanta `LB_PER_KG = 2.20462` per FR-054. Zaokrouhlení na 1 desetinné místo pro display.
- [ ] T008 [P] Vytvořit `gymtracker/src/lib/equipmentMapping.ts` exportující `EquipmentChip` enum, `EQUIPMENT_CHIP_LABEL_CS` mapping, lookup tabulku raw→chip (per research.md R4), a funkci `mapEquipmentToChip(raw)`. Nemapované → `'other'`.
- [ ] T009 Vytvořit `gymtracker/src/hooks/useUnitPreference.ts` jako thin selector nad `useProfile()`: vrací `{ unit, setUnit }`. `setUnit` volá `updateProfile({ preferred_unit })`. Re-render se propaguje přes existující profile state.
- [ ] T010 Vytvořit `gymtracker/src/components/workouts/WeightInput.tsx` — controlled input přijímající `value_kg: number | null`, `onChangeKg(kg)`. Interně používá `useUnitPreference()` + `units.ts` pro display↔storage konverzi. Akceptuje 1 desetinné místo input.
- [ ] T011 Rozšířit `gymtracker/app/(app)/profile.tsx` o sekci "Nastavení tréninku" se 2 ovládacími prvky: (a) segmented `preferred_unit` kg/lb, (b) number input `default_rest_seconds` (5–600). Hodnoty číst/zapisovat přes `updateProfile`.

**Checkpoint**: DB schema je v produkci, profil podporuje rest + unit, kg/lb konverze + equipment mapping jsou hotové. Můžou začít všechny 4 US paralelně.

---

## Phase 3: User Story 1 — Workout Templates (Priority: P1) 🎯 MVP část 1/2

**Goal**: Uživatel může vytvořit, editovat, smazat workout šablonu se Strong-style target hodnotami a jedním tapem spustit trénink podle ní.

**Independent Test**: Per [quickstart.md](./quickstart.md) sekce US1 (T1.1–T1.7). Klíčové: vytvořit "Push day" s 5 cviky a target hodnotami, zavřít app, znovu otevřít, spustit z šablony → workout obsahuje předvyplněné série.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Vytvořit `gymtracker/src/hooks/useWorkoutTemplates.ts` implementující smlouvu z [contracts/workout-templates.ts](./contracts/workout-templates.ts): `templates`, `createTemplate`, `renameTemplate`, `deleteTemplate`, `addExerciseToTemplate`, `updateTemplateExercise`, `removeTemplateExercise`, `reorderTemplateExercises`, `startFromTemplate`. `startFromTemplate` musí LEFT JOIN na `exercises` a vracet `missingExerciseCount`.
- [ ] T013 [P] [US1] Vytvořit `gymtracker/src/components/workouts/TemplateCard.tsx` — karta s názvem šablony, počtem cviků, last-updated datem, tap → navigace na editor / Spustit akce.
- [ ] T014 [P] [US1] Vytvořit `gymtracker/src/components/workouts/TemplateExerciseRow.tsx` — řádek v editoru šablony: název cviku, 3× input (target_sets / target_reps / target_weight přes `<WeightInput>`), drag handle pro DnD (fallback chevron up/down). Onchange volá `updateTemplateExercise`.
- [ ] T015 [US1] Vytvořit `gymtracker/app/(app)/workouts/templates/index.tsx` — seznam šablon (FlatList `<TemplateCard>`), empty state s CTA "Vytvořit šablonu", header tlačítko "Nová šablona". Zobrazení per FR-001/FR-006. Tap karty → otevře `templates/[id]`.
- [ ] T016 [US1] Vytvořit `gymtracker/app/(app)/workouts/templates/[id].tsx` — editor: textový input pro `name`, `DraggableFlatList` cviků (fallback `FlatList` + chevron tlačítka, viz research.md R3), tlačítko "Přidat cvik" otevírající exercise picker (sdílí stejný picker pattern jako `workouts/[id].tsx`, doplníme equipment chips v US4), tlačítko "Smazat šablonu". Save je auto / debounced. Drag-end → `reorderTemplateExercises(templateId, orderedIds)`.
- [ ] T017 [US1] Rozšířit `gymtracker/src/hooks/useWorkouts.ts` o metodu `createWorkoutFromTemplate(templateId)` která interně volá `useWorkoutTemplates().startFromTemplate(templateId)` a publikuje vytvořený workout do `workouts` state. Alternativně export `startFromTemplate` přímo z templates hooku a delegace v UI.
- [ ] T018 [US1] Rozšířit `gymtracker/app/(app)/workouts/index.tsx` o entry pro šablony (button "Šablony" otevírající `workouts/templates`) a integraci dialogu pro aktivní rozpracovaný workout per research.md R8 (3-action Alert před vytvořením z šablony).
- [ ] T019 [US1] Implementovat missing-exercise toast/Alert ve flow `startFromTemplate`: pokud `missingExerciseCount > 0`, ukázat "N cviků bylo odstraněno, protože už neexistují" po navigaci na nový workout. Použít existující toast/alert pattern z app.

**Checkpoint**: US1 plně funkční nezávisle. Quickstart T1.1–T1.7 procházejí. ⚠️ DnD perf prověřit; pokud problém, fallback chevrons jsou OK (per assumption ve spec).

---

## Phase 4: User Story 2 — Rest Timer (Priority: P1) 🎯 MVP část 2/2

**Goal**: Po uložení série startuje countdown timer; v popředí zvuk + haptika, na pozadí local push notifikace. Cold-start obnovuje běžící timer. Default délka konfigurovatelná v profilu.

**Independent Test**: Per [quickstart.md](./quickstart.md) sekce US2 (T2.1–T2.9). Klíčové: T2.6 cold-start restore, T2.8 OS notifikace zakázané.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Vytvořit `gymtracker/src/lib/notifications.ts` implementující `NotificationsAPI` z [contracts/rest-timer.ts](./contracts/rest-timer.ts): `setupNotificationHandler` (`Notifications.setNotificationHandler` s `shouldShowAlert: true`), `scheduleRestDoneNotification(afterSeconds)` (`scheduleNotificationAsync` s title `Konec pauzy`, body `Pokračuj v tréninku`, trigger `{ seconds: afterSeconds }`), `cancelScheduledNotification(id)`, `getPermissionStatus`, `requestPermissions`.
- [ ] T021 [P] [US2] Vytvořit `gymtracker/src/lib/restTimerStorage.ts` implementující `RestTimerStorage`: `load/save/clear` přes `AsyncStorage` na klíči `@gymtracker/restTimer`. Persisted shape per [contracts/rest-timer.ts](./contracts/rest-timer.ts) `PersistedRestTimer`.
- [ ] T022 [US2] Vytvořit `gymtracker/src/hooks/useRestTimer.ts` implementující `UseRestTimer`: state machine `idle → running → done` (+ pause/resume větve per data-model.md), interní `setInterval` pro tick každou 1 s, na mount load z `restTimerStorage` + resume / clear podle uplynulého času (per FR-015/FR-016), na `start` volat `notifications.scheduleRestDoneNotification` + `storage.save`, na `done` zvuk (`expo-av`) + haptika (`expo-haptics`), na skip/reset cancel notifikaci. `ensureNotificationPermission` volá při prvním `start`.
- [ ] T023 [US2] Vytvořit `gymtracker/src/components/workouts/RestTimer.tsx` — UI vrstva nad `useRestTimer`: velká countdown čísla, tlačítka `+15 s` / `Pause` / `Skip`. Schovat když `state.status === 'idle'`.
- [ ] T024 [US2] V `gymtracker/app/_layout.tsx` (root layout) zavolat `notifications.setupNotificationHandler()` v `useEffect` při mount (jen jednou per app lifecycle).
- [ ] T025 [US2] Integrovat `<RestTimer/>` do `gymtracker/app/(app)/workouts/[id].tsx`. Po uložení série (existující flow) zavolat `restTimer.start(workoutId, profile.default_rest_seconds)`. Render `<RestTimer/>` nad další sérií.
- [ ] T026 [US2] Implementovat permission-denied dialog per FR-017: při prvním `start` v session zjistit permission status; pokud `denied` (a flag `restTimer.permissionDialogShownThisSession` nedrží), ukázat `Alert.alert("Notifikace zakázané", "Bez notifikace se neupozorníme na konec pauzy. Otevřít nastavení?", [{ text: "Otevřít", onPress: Linking.openSettings }, { text: "Zrušit" }])` a flag uložit do paměti session (in-memory, ne AsyncStorage — per FR-017 "v rámci stejné session").

**Checkpoint**: US2 plně funkční nezávisle. Quickstart T2.1–T2.9 procházejí na iOS i Android. ⚠️ Cold-start restore otestovat force-killnutím app v task manageru.

**🎯 MVP achieved** — US1 + US2 dohromady = use-case "spustím Push day → cvičím s rest timerem mezi sériemi". Možno deploy / showcase i bez US3/US4.

---

## Phase 5: User Story 3 — Historie tréninků (Priority: P2)

**Goal**: Záložka Historie se seznamem dokončených workoutů seskupených po dnech, detail per cvik se sériemi. Funguje pro 100+ workoutů bez lagu.

**Independent Test**: Per [quickstart.md](./quickstart.md) sekce US3 (T3.1–T3.5).

### Implementation for User Story 3

- [ ] T027 [P] [US3] Vytvořit `gymtracker/src/hooks/useWorkoutHistory.ts` — paginated query (`range(offset, offset+29)`) workoutů s `finished_at IS NOT NULL`, řazené `started_at DESC`. Vrací `{ days: Array<{ date, workouts: Workout[] }>, loadMore, loading, hasMore }`. Grouping po dnech v JS přes `.toLocaleDateString()` (lokální TZ uživatele).
- [ ] T028 [P] [US3] Vytvořit `gymtracker/src/components/workouts/HistoryDayGroup.tsx` — sekce: header s datem, list karet workoutů. Karta zobrazuje název, čas, počet cviků, počet sérií, total volume (v preferred unit) + dobu trvání. Per FR-021. Total volume agregovat z `workout_sets` (require join v useWorkoutHistory).
- [ ] T029 [US3] Vytvořit `gymtracker/app/(app)/workouts/history/index.tsx` — `FlatList` s `initialNumToRender=15`, `windowSize=5`, `removeClippedSubviews=true`, `onEndReached={loadMore}`. Empty state s CTA "Začít první trénink" navigujícím na `workouts/index.tsx`.
- [ ] T030 [US3] Vytvořit `gymtracker/app/(app)/workouts/history/[id].tsx` — detail: header (název, datum, total volume, duration), per cvik seznam sérií (reps × weight v preferred unit) + max weight. Read-only view.

**Checkpoint**: US3 plně funkční. Otestovat lazy load se seedovanými 100+ workouty.

---

## Phase 6: User Story 4 — Equipment filtr (Priority: P3)

**Goal**: Druhá řada chipů v exercise pickeru zužuje výběr cviků podle vybavení; multi-select; AND s body_part filtrem.

**Independent Test**: Per [quickstart.md](./quickstart.md) sekce US4 (T4.1–T4.6).

### Implementation for User Story 4

- [ ] T031 [P] [US4] Vytvořit `gymtracker/src/hooks/useExerciseFilters.ts` implementující `UseExerciseFilters` z [contracts/equipment-facets.ts](./contracts/equipment-facets.ts): state pro `bodyParts` a `equipmentChips`, `toggleEquipmentChip`, `clearEquipmentChips`, `applyFilters(exercises)`. Filtry session-only (per FR-043) — žádná persistence.
- [ ] T032 [P] [US4] Vytvořit `gymtracker/src/components/workouts/EquipmentChips.tsx` — horizontal scroll row 8 chipů per `EQUIPMENT_CHIP_LABEL_CS`, multi-select state, callback `onToggle(chip)`.
- [ ] T033 [US4] Integrovat equipment filter do exercise pickeru v `gymtracker/app/(app)/workouts/[id].tsx`. Pod existující body_part filter řádek přidat `<EquipmentChips/>`. Stávající `exercises.filter(e => ...)` rozšířit o equipment filtr přes `mapEquipmentToChip(e.equipment)`. Empty state pro 0 cviků v kombinaci filtrů. Aplikovat **stejnou integraci** v editoru šablon z T016 (`workouts/templates/[id].tsx`) — picker při přidávání cviku do šablony.

**Checkpoint**: US4 plně funkční na obou místech, kde se vybírá cvik.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Účel**: Validace, regression, dokumentace.

- [ ] T034 Spustit `npx tsc --noEmit` v `gymtracker/`, opravit všechny TS chyby. Žádný `any`, žádný `@ts-ignore`.
- [ ] T035 Projít celý [quickstart.md](./quickstart.md) na fyzickém iOS a fyzickém Android zařízení (alespoň jedno každé). Zaznamenat výsledky T1.1–T4.6 + TG.1–TG.3 + Regression sekce.
- [ ] T036 [P] Aktualizovat `DEV_DIARY.md` v root repa s log entries za každý milestone (Setup, Foundational, US1, US2, US3, US4, Polish).
- [ ] T037 [P] Aktualizovat `CURRENT_HANDOFF.md` se stavem po sprintu (co je hotové, co zbývá, kde jsou potenciální issues).
- [ ] T038 Ověřit SC-001 až SC-008 měřením na zařízení (časy z šablony do první série; FPS scrolling historie; přepnutí kg↔lb). Zapsat výsledky do `DEV_DIARY.md`.
- [ ] T039 [P] Zaktualizovat `PROJECT_PLAN.md` — odškrtnout Sprint I, nastavit Sprint J jako next.
- [ ] T040 Verify RLS: ze second-test-account ověřit `SELECT * FROM workout_templates` vrací 0 řádků cizího uživatele (per FR-002, FR-051).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Bez závislostí, lze začít hned. T001 vyžaduje user approval (nové deps).
- **Foundational (Phase 2)**: Vyžaduje T001 (deps) + T003 (folder). T004 (DB migrace) vyžaduje user approval. **Bez Phase 2 nelze začít žádnou US.**
- **User Stories (Phase 3–6)**: Všechny závisí na kompletním Phase 2. Mezi sebou jsou nezávislé (per spec "Independent Test").
- **Polish (Phase 7)**: Vyžaduje dokončení všech zamýšlených US.

### User Story Dependencies

- **US1 (Templates)**: Nezávislé na US2/US3/US4. Používá `WeightInput` (T010) z Foundational.
- **US2 (Rest Timer)**: Nezávislé na US1/US3/US4. Sdílí jen `profile.default_rest_seconds` z Foundational (T006/T011).
- **US3 (Historie)**: Read-only, čte existující workouts + workout_sets + nový `template_id` (read-only). Žádná závislost na US1/US2/US4.
- **US4 (Equipment filtr)**: Integruje do pickeru který je v `workouts/[id].tsx` (US2 ho také edituje) a v `templates/[id].tsx` (US1 ho zakládá). **Doporučení**: dokončit US1 + US2 dřív, aby T033 nemělo merge konflikty; nebo držet US4 v samostatném worktree a sloučit nakonec.

### Within Each User Story

- Hooks a lib před komponentami.
- Komponenty před screens (`app/(app)/...`).
- Integrační task ((T018, T025, T033) na konci své US.

### Parallel Opportunities

**Phase 1**: T002 + T003 [P] paralelně.
**Phase 2**: T005 + T006 + T007 + T008 [P] paralelně (různé soubory, žádné kruhové závislosti). T009 čeká na T006. T010 čeká na T007. T011 čeká na T006.
**Phase 3 (US1)**: T012 + T013 + T014 [P] paralelně.
**Phase 4 (US2)**: T020 + T021 [P] paralelně. T022 čeká na obojí.
**Phase 5 (US3)**: T027 + T028 [P] paralelně.
**Phase 6 (US4)**: T031 + T032 [P] paralelně.
**Phase 7**: T036 + T037 + T039 [P] paralelně.

### Mezi-fázový paralelní development (multi-session/worktree)

Po dokončení Phase 2 (Foundational) lze pustit US v paralelních git worktree:

```bash
# z gym-tracker/
git worktree add ../gym-tracker-us2 -b 001-workout-ux-polish-us2
git worktree add ../gym-tracker-us3 -b 001-workout-ux-polish-us3
git worktree add ../gym-tracker-us4 -b 001-workout-ux-polish-us4
```

Hlavní worktree drží US1; ostatní v sub-branche. Pozor: T033 (US4 integration do pickeru) potřebuje sloučit s `workouts/[id].tsx` z hlavní branche — udělat naposledy.

---

## Parallel Example: User Story 1

```bash
# Po dokončení Foundational pusť tři hooks/komponenty zaráz:
Task: "Implement useWorkoutTemplates hook in gymtracker/src/hooks/useWorkoutTemplates.ts"
Task: "Create TemplateCard component in gymtracker/src/components/workouts/TemplateCard.tsx"
Task: "Create TemplateExerciseRow component in gymtracker/src/components/workouts/TemplateExerciseRow.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

Spec uvádí US1 i US2 jako P1 = oba součástí MVP.

1. Phase 1 (Setup) — schválit `expo install` deps.
2. Phase 2 (Foundational) — schválit DB migraci, aplikovat, ověřit.
3. Phase 3 (US1) — Templates → Quickstart T1.x.
4. Phase 4 (US2) — Rest Timer → Quickstart T2.x.
5. **STOP and VALIDATE**: Spustit Push day workout end-to-end (založ šablonu → spusť → cvič s rest timerem).
6. Deploy / showcase i bez US3/US4.

### Incremental Delivery

- ✅ Po MVP: US3 (Historie) → Quickstart T3.x → deploy.
- ✅ Po US3: US4 (Equipment chips) → Quickstart T4.x → deploy.
- ✅ Polish (Phase 7).

### Parallel Team / Multi-Session Strategy

Po Phase 2:
- Session A (hlavní worktree): US1 (T012–T019) — největší rozsah, drží hlavní branch
- Session B (worktree `-us2`): US2 (T020–T026) — self-contained
- Session C (worktree `-us3`): US3 (T027–T030) — read-only nad existujícími tabulkami
- Session D (worktree `-us4`): US4 (T031–T033) — **T033 sloučit nakonec** po US1 a US2

Po merge všech feature branches: Phase 7 v hlavní branchi.

---

## Notes

- [P] tasks = různé soubory, žádné závislosti.
- [Story] label mapuje task na US v spec.md.
- Commit po každém logickém milestone (per [[feedback-speckit-commit-per-phase]] preferenci uživatele — v Sprint I to bude per task / per US checkpoint).
- T001 (deps) a T004 (DB migrace) **vyžadují explicit user approval** per CLAUDE.md projektu.
- Žádný `any` v TS, žádný broken build v gitu.
- Pokud `react-native-draggable-flatlist` nesedne s RN 0.81/React 19, switch na move-up/move-down fallback (per research.md R3) — zaznamenat v `DEV_DIARY.md`.
