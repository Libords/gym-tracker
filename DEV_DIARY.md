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
