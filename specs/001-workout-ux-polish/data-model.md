# Phase 1: Data Model — Workout UX Polish (Sprint I)

**Date**: 2026-05-19 | **Branch**: `001-workout-ux-polish`

Autoritativní popis DB entit, vztahů, validačních pravidel a RLS policies. SQL je v `contracts/db-schema.sql`.

---

## Přehled změn

| Akce | Objekt | Účel |
|---|---|---|
| 🆕 CREATE TABLE | `workout_templates` | Uložené rutiny per user (US1) |
| 🆕 CREATE TABLE | `template_exercises` | Cviky v šabloně + target values (US1) |
| 🔧 ALTER TABLE | `profiles` ADD `default_rest_seconds int default 90` | Default délka rest timeru (US2) |
| 🔧 ALTER TABLE | `profiles` ADD `preferred_unit text default 'kg' CHECK IN ('kg','lb')` | UI display jednotka (FR-053) |
| 🔧 ALTER TABLE | `workouts` ADD `template_id uuid null references workout_templates(id) on delete set null` | Volitelný link na šablonu pro analytiku (FR-005) |

Žádné změny `workout_sets`, `exercises` ani existujících sloupců — historie a equipment filtr čtou jen.

---

## Entity

### 1. `workout_templates`

**Účel**: Uložená rutina patřící jednomu uživateli, Strong-style — uživatel jednou definuje a opakovaně spouští.

**Sloupce**:

| Sloupec | Typ | Constraints | Poznámka |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` | RLS owner |
| `name` | `text` | NOT NULL, `length(name) BETWEEN 1 AND 80` | České názvy ("Push day") |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Trigger nebo manual update na change |

**Indexy**: `(user_id, updated_at DESC)` pro list view.

**Validační pravidla** (per FR):
- FR-001: CRUD per user
- FR-002: RLS scope per `user_id`
- FR-006: žádný count limit — DB to neenforcuje, UI také ne

---

### 2. `template_exercises`

**Účel**: Položka šablony — cvik s pozicí, target sets, target reps, target weight (Strong-style).

**Sloupce**:

| Sloupec | Typ | Constraints | Poznámka |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `template_id` | `uuid` | NOT NULL, FK → `workout_templates(id) ON DELETE CASCADE` | |
| `exercise_id` | `uuid` | NOT NULL, FK → `exercises(id) ON DELETE CASCADE` | Smazání cviku v master DB vyřadí položku ze šablon (per Edge Case "smazání cviku ze šablony" — UX toast řeší frontend, DB úroveň jen cascade) |
| `order_index` | `int` | NOT NULL, `order_index >= 0` | Pořadí v šabloně, 0-based |
| `target_sets` | `int` | NOT NULL, `target_sets >= 1`, default 3 | FR-008 |
| `target_reps` | `int` | NOT NULL, `target_reps >= 1`, default 10 | FR-008 |
| `target_weight_kg` | `numeric(6,2)` | NULL allowed, `target_weight_kg >= 0` when not null | FR-008 + FR-009 (canonical kg) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexy**:
- UNIQUE `(template_id, order_index)` — žádné dvě položky stejnou pozici
- `(template_id, order_index)` covering index pro list view šablony

**Validační pravidla**:
- FR-008: NOT NULL pro `target_sets` / `target_reps`; nullable `target_weight_kg` pro bodyweight cviky
- FR-007: reorder UX — frontend přepíše `order_index` na všech řádcích batch updatem
- Při run-time vytvoření workoutu ze šablony — frontend vygeneruje `target_sets` prázdných `workout_sets` řádků s předvyplněnými `target_reps` jako `reps` a `target_weight_kg` jako `weight_kg`

---

### 3. `profiles` (rozšíření existující tabulky)

**Nové sloupce**:

| Sloupec | Typ | Default | Constraint |
|---|---|---|---|
| `default_rest_seconds` | `int` | `90` | `default_rest_seconds BETWEEN 5 AND 600` |
| `preferred_unit` | `text` | `'kg'` | `preferred_unit IN ('kg', 'lb')` |

**Validační pravidla**:
- FR-014: default 90 s konzistentní se Strong/Hevy
- FR-053: enum kg/lb, default kg
- Migrace musí být backwards-compatible — DEFAULT pokrývá existující řádky

---

### 4. `workouts` (rozšíření)

**Nový sloupec**:

| Sloupec | Typ | Default | Constraint |
|---|---|---|---|
| `template_id` | `uuid` | NULL | FK → `workout_templates(id) ON DELETE SET NULL` |

**Validační pravidla**:
- FR-004: editace šablony NESMÍ retroaktivně měnit historii — žádný cascade-update, historie cviků sedí v `workout_sets`, ne v `template_exercises`
- FR-005: smazání šablony → `ON DELETE SET NULL` osamostatní historický workout

---

## RLS Policies

**Princip**: každá tabulka má 4 policies (SELECT, INSERT, UPDATE, DELETE) omezené na `auth.uid() = user_id` (nebo přes JOIN pro template_exercises).

### `workout_templates`

```sql
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wt_select_own" ON workout_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wt_insert_own" ON workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wt_update_own" ON workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "wt_delete_own" ON workout_templates FOR DELETE USING (auth.uid() = user_id);
```

### `template_exercises`

Vlastnictví derivované přes JOIN na `workout_templates.user_id`:

```sql
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "te_select_own" ON template_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = template_id AND wt.user_id = auth.uid())
);
CREATE POLICY "te_insert_own" ON template_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = template_id AND wt.user_id = auth.uid())
);
CREATE POLICY "te_update_own" ON template_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = template_id AND wt.user_id = auth.uid())
);
CREATE POLICY "te_delete_own" ON template_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = template_id AND wt.user_id = auth.uid())
);
```

### `profiles`, `workouts`

Předpokládáme, že existující RLS policies na `profiles` a `workouts` jsou už nastavené z předchozích sprintů; nové sloupce automaticky dědí. Pokud `profiles` ještě nemá RLS, migrace ji nezapíná (mimo scope sprintu — řeší existující auth setup). **Action item v Phase 2**: ověřit `SELECT relrowsecurity FROM pg_class WHERE relname IN ('profiles','workouts')`.

---

## State Transitions

### Životní cyklus šablony

```
[neexistuje] ── create template ──> [draft, 0 cviků]
                                       │
                                       ├── add exercise ──> [s 1+ cviky]
                                       ├── reorder ──> [s 1+ cviky]
                                       ├── update target ──> [s 1+ cviky]
                                       └── delete ──> [neexistuje]
                                                      (workouts.template_id se SET NULL)
```

### Životní cyklus rest timeru (lokální stav, není v DB)

```
[idle] ── uložit sérii ──> [running] (AsyncStorage save + schedule notification)
                              │
                              ├── tick ──> [running]
                              ├── doběhne ──> [done] (sound+haptic+notif fired)
                              │              │
                              │              └── auto-clear ──> [idle]
                              ├── +15s ──> [running] (extend duration + reschedule)
                              ├── pause ──> [paused] (cancel notif, freeze remaining)
                              │              │
                              │              └── resume ──> [running] (re-schedule)
                              └── skip/reset ──> [idle] (cancel notif, clear storage)
```

---

## Datový tok: spuštění workoutu ze šablony

```
1. user tap "Spustit" v templates/index.tsx
2. useWorkoutTemplates.startFromTemplate(templateId)
   a. SELECT template_exercises te LEFT JOIN exercises e
      WHERE te.template_id = $1 ORDER BY te.order_index
   b. filter rows kde e IS NOT NULL → missingCount
   c. INSERT workouts (user_id, name=template.name, template_id=$1, started_at=now())
      → workout_id
   d. BATCH INSERT workout_sets pro každou položku šablony:
       FOR i IN 0..target_sets-1:
         INSERT (workout_id, exercise_id, set_number=i+1, reps=target_reps, weight_kg=target_weight_kg)
3. navigate to /workouts/[workout_id]
4. pokud missingCount > 0 → Toast "N cviků bylo odstraněno"
```

---

## Velikost a růst

- `workout_templates`: očekáváno < 20 řádků per user
- `template_exercises`: očekáváno < 200 řádků per user (20 šablon × ~10 cviků)
- `workouts.template_id`: backfill není potřeba (NULL pro existující), žádná data migration overhead

Celkový impact na storage zanedbatelný.
