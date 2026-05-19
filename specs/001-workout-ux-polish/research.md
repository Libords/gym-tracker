# Phase 0: Research — Workout UX Polish (Sprint I)

**Date**: 2026-05-19 **Branch**: `001-workout-ux-polish`

Vyřešené otevřené otázky pro implementaci Sprintu I. Vše vyřešeno — žádné zbylé `NEEDS CLARIFICATION`.

---

## R1: Lokální push notifikace na Expo SDK 54

**Decision**: Použít `expo-notifications` s `scheduleNotificationAsync({ trigger: { seconds: N } })` při startu rest timeru. Plus eager fallback (timer v JS pro popředí, vibrace + zvuk přes `expo-haptics` + `expo-av` v okamžiku doběhu).

**Rationale**:
- Expo SDK 54 doporučuje `expo-notifications` pro local push (server push není potřeba, žádný backend).
- Naplánováním notifikace v okamžiku startu pauzy získáme garantované upozornění i když je app killed nebo na pozadí (OS sám doručí notifikaci podle `seconds` triggeru).
- Pokud uživatel "Skip"-ne nebo zastaví timer, voláme `cancelScheduledNotificationAsync(id)`.

**Alternatives considered**:
- BackgroundFetch / Headless task: nepotřebné, OS nativně řeší scheduled notification.
- Server-push přes Supabase Edge Function: zbytečná závislost na backendu pro čistě lokální feature.

**Permissions handshake**: per FR-017 — při prvním spuštění rest timeru zavolat `Notifications.getPermissionsAsync()`. Pokud `granted === false` a `canAskAgain === true`, zavolat `requestPermissionsAsync()`. Pokud `denied`, zobrazit Alert s tlačítkem `Linking.openSettings()`. Flag "dialog already shown" držíme **in-memory** (module-level proměnná v `notifications.ts` nebo hook ref), aby se resetoval s app procesem — per FR-017 "v rámci stejné session". Žádný AsyncStorage: po restartu app je legitimní dialog znovu zobrazit (uživatel mezi tím mohl OS settings změnit).

**Text notifikace** (FR-013, locked v clarification): title `Konec pauzy`, body `Pokračuj v tréninku`.

---

## R2: Persistence rest timeru přes cold-start

**Decision**: AsyncStorage key `@gymtracker/restTimer` ukládá JSON `{ workoutId, startedAt: ISO, durationSec, scheduledNotificationId }`. Při mount `<RestTimer>` načteme stav; pokud `(now - startedAt) < durationSec` → obnovíme countdown na zbytek; jinak → ignorujeme a smažeme klíč (per FR-016, NESMÍ znovu zazvonit).

**Rationale**:
- AsyncStorage je standardní React Native KV store, podporovaný v Expo SDK 54 bez native modulu navíc (`@react-native-async-storage/async-storage` už je v dependencies).
- ISO timestamp + duration je dost na restore (jednoduché odečtení od `Date.now()`).
- Per FR-015 lokálně only, žádná cloud sync — uživatel akceptuje ztrátu při přeinstalaci/přechodu na jiné zařízení.
- `scheduledNotificationId` uložen proto, abychom uměli cancel při Skip / Reset.

**Alternatives considered**:
- SecureStore (`expo-secure-store`): zbytečné, timer state není sensitive.
- Supabase realtime: porušuje FR-015 (cloud sync vyloučen) + offline-friendly princip.

---

## R3: Drag & drop reorder cviků v šabloně

**Decision**: Knihovna `react-native-draggable-flatlist` (verze kompatibilní s `react-native-reanimated` ~3.x a `react-native-gesture-handler` ~2.x), instalovat v Sprint I. Fallback: pokud peer-deps konflikt s RN 0.81/React 19 nelze rychle vyřešit, dodáme `move up / move down` šipky vedle každého řádku (per assumption v spec, akceptovatelný fallback).

**Rationale**:
- Standard solution pro RN DnD seznam, well-maintained, používá Reanimated worklets — plynulé na 60 fps.
- Spec povoluje fallback chevron tlačítka, takže není to blocker pro completion sprintu.

**Alternatives considered**:
- Vlastní implementace s PanResponder: vysoký risk, časová past.
- `react-native-sortable-list`: starší, méně aktivně udržovaná.

**Action item**: Verify peer-deps compatibility během prvního `npm install` v `/speckit-implement`. Pokud konflikt → switch na fallback, dokumentovat v `DEV_DIARY.md`.

---

## R4: Equipment mapping — raw → canonical chips

**Decision**: Statický TypeScript modul `src/lib/equipmentMapping.ts` exportující `Record<string, EquipmentChip>` lookup + funkci `mapEquipmentToChip(raw: string | null): EquipmentChip`. Nemapované hodnoty (včetně `null`) → `'other'`.

**Rationale**:
- Per clarification: explicit lookup tabulka v kódu, ne v DB (žádná join komplexita, snadno rozšiřitelné PR).
- Free-exercise-db má omezenou enum sadu pro `equipment` (~25 hodnot dle průzkumu dat ze Sprintu H); explicit mapping je tractable.
- 8 canonical chipů per FR-040: `dumbbell` (Činka), `barbell` (Osa), `cable` (Kabel), `machine` (Stroj), `bodyweight` (Vlastní váha), `kettlebell`, `bands`, `other` (Žádné/Other).

**Initial mapping draft** (rozšiřitelný):

| raw (free-exercise-db) | canonical chip | český label |
|---|---|---|
| `dumbbell` | `dumbbell` | Činka |
| `barbell` | `barbell` | Osa |
| `e-z curl bar` | `barbell` | Osa |
| `cable` | `cable` | Kabel |
| `machine` | `machine` | Stroj |
| `body only` | `bodyweight` | Vlastní váha |
| `kettlebells` | `kettlebell` | Kettlebell |
| `bands` | `bands` | Bands |
| `exercise ball` | `other` | Žádné/Other |
| `medicine ball` | `other` | Žádné/Other |
| `foam roll` | `other` | Žádné/Other |
| `other` | `other` | Žádné/Other |
| `null` | `other` | Žádné/Other |

**Action item**: Před release mappingu spustit SQL `SELECT DISTINCT equipment, COUNT(*) FROM exercises GROUP BY equipment` a doplnit jakékoli nepokryté hodnoty.

**Alternatives considered**:
- Nový sloupec `exercises.equipment_chip` s migrací dat: composes komplexitu pro mapping který lze klidně držet v TS.
- View v Supabase: zbytečná abstrakce pro statický mapping.

---

## R5: kg ↔ lb display layer (preferred_unit)

**Decision**: Canonical storage je vždy `numeric` v kg (DB sloupce `weight_kg`, `target_weight_kg`). UI vrstva čte profile.preferred_unit (`'kg' | 'lb'`) přes nový hook `useUnitPreference()` a používá pure funkce z `src/lib/units.ts`:

```ts
export const kgToLb = (kg: number) => kg * 2.20462
export const lbToKg = (lb: number) => lb / 2.20462
export const formatWeight = (kg: number, unit: Unit, opts?: { decimals?: number }) => ...
```

Reusable komponenta `<WeightInput value_kg={...} onChangeKg={...} />` interně konvertuje displej hodnotu do/z preferred unit; persistuje vždy kg.

**Rationale**:
- Per FR-009 + FR-053 + SC-008: DB canonical, UI on-the-fly, žádný duplicitní lb sloupec.
- Konstanta 2.20462 per FR-054.
- Změna preference triggeruje re-render všech komponent závislých na `useUnitPreference` přes context / hook subscription — < 500 ms target.

**Rounding**: zobrazované hodnoty zaokrouhlit na 1 desetinné místo (per FR-054). Vstupy: input akceptuje 1 desetinné místo, parse na float, konvertuje na kg pro storage.

**Alternatives considered**:
- Dual storage (kg + lb sloupce): porušuje single-source-of-truth, riziko driftu.
- Konverze v DB views: znesnadňuje psaní; React-side konverze je triviální.

---

## R6: Supabase schema migrace workflow

**Decision**: Migrace existuje jako jediný SQL soubor `supabase/migrations/20260520_workout_templates_and_units.sql` v root repa (mimo `gymtracker/`). Aplikuje se přes Supabase CLI nebo manuálně přes Supabase SQL editor (per existující praxi projektu).

**Rationale**:
- Per CLAUDE.md projektu: "Supabase migrace (změny DB schématu)" vyžadují user approval — `/speckit-implement` musí explicit pauzovat před aplikací migrace.
- Idempotentní pattern: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (pro retry-safe DX).
- Žádný down-migration soubor v této fázi (forward-only, konzistentní s existujícím workflow projektu).

**Action item**: Před aplikací migrace ověřit, že `supabase/migrations/` folder existuje a má pohledávané předchozí migrace. Pokud ne (čistý projekt), vytvořit folder + tento první soubor.

---

## R7: Lazy load historie tréninků

**Decision**: `FlatList` s `initialNumToRender=15`, `windowSize=5`, `removeClippedSubviews=true`. Data fetchovat paginovaně `range(offset, offset + 30 - 1)` přes Supabase JS klient; `onEndReached` triggeruje další stránku.

**Rationale**:
- Per FR-023: max 30 workoutů v první batch.
- Per SC-003: 200 workoutů < 1 s + scroll ≥ 55 FPS — FlatList tuning je standardní way.
- Day grouping (per FR-020) řešíme JS-side z fetched rows: groupBy `started_at.split('T')[0]` (lokální TZ ošetříme přes `toLocaleDateString()`).

**Alternatives considered**:
- SectionList: hezčí API pro grouped data, ale slabší perf na velkých datech a horší integrace s pagination patterny.
- Server-side grouping (Supabase RPC): zbytečná komplexita, JS groupBy stačí pro N ≤ 500 řádků.

---

## R8: Co s rozpracovaným workoutem při startu z šablony

**Decision**: V `app/(app)/workouts/templates/index.tsx` před voláním `createWorkoutFromTemplate` zkontrolovat existenci workout s `finished_at IS NULL` pro current user. Pokud existuje, zobrazit `Alert` se 3 akcemi: **Pokračovat v rozpracovaném** (navigace na `/workouts/[id]`), **Zahodit a začít nový** (mark current as deleted nebo `finished_at = now()`, pak vytvořit nový z šablony), **Zrušit**.

**Rationale**:
- Per Edge Cases v spec — explicitně popsaný UX.
- Konzistentní s tím, jak by se chovala Strong app.

---

## R9: Smazaný cvik v šabloně

**Decision**: Per Edge Cases — při spuštění workoutu ze šablony JOINujeme template_exercises s exercises; missing exercise (kvůli smazání z DB) přeskočíme a zobrazíme `Toast`/`Alert`: "N cviků bylo odstraněno, protože už neexistují".

**Implementační detail**:
- `useWorkoutTemplates.startFromTemplate(templateId)`:
  - SELECT template_exercises JOIN exercises (LEFT JOIN aby zůstaly i missing)
  - filtrovat řádky s `exercise IS NOT NULL`
  - vytvořit nový workout + insert workout_sets podle filtrovaných řádků
  - vrátit `{ workout, missingCount }` pro Toast

---

## Rozhodnutí mimo scope (zaznamenané pro budoucnost)

- **Per-set warmup/drop sety**: spec assumption — počká na pozdější sprint, šablona je uniformní per-cvik.
- **Couple/trainer template sharing**: VISIONS.md 5 + 15.5, mimo scope Sprint I.
- **PRs / strength standards / volume trendy**: Sprint J.
- **Web target**: rest timer + push notifikace nepodporují web, sprint je mobile-only.

---

**Phase 0 verdikt**: ✅ Všechny otázky vyřešené, žádné `NEEDS CLARIFICATION` v Technical Context. Můžu přejít na Phase 1 (Design & Contracts).
