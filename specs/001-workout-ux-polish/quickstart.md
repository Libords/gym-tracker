# Quickstart — Workout UX Polish (Sprint I)

**Date**: 2026-05-19 | **Branch**: `001-workout-ux-polish`

Manuální test plán pokrývající 4 User Stories ze spec.md. Spouštěn na fyzickém zařízení (iOS i Android) přes Expo Go nebo Dev Build po dokončení implementace.

---

## Předpoklady

1. Migrace `supabase/migrations/20260520_workout_templates_and_units.sql` aplikovaná v Supabase projektu.
2. Lokální dev server běží:
   ```powershell
   cd gym-tracker\gymtracker
   npx expo start
   ```
3. TypeScript bez chyb:
   ```powershell
   cd gym-tracker\gymtracker
   npx tsc --noEmit
   ```
4. Testovací účet přihlášený, alespoň 1 existující dokončený workout pro US3.
5. Notifikace povolené v OS settings pro Expo Go / Dev Build (jinak ověřit US2 fallback flow).

---

## US1 — Workout Templates (P1)

### T1.1 Prázdný stav
- Přejdi na Workouts → "Šablony".
- ✅ Vidím empty state "Žádné šablony zatím" + tlačítko "Vytvořit šablonu".

### T1.2 Vytvoření a uložení šablony "Push day"
- Klik "Vytvořit šablonu" → název "Push day".
- Přidat 5 cviků (Bench press, Incline DB press, OHP, Dips, Triceps pushdown).
- U každého nastavit target sets=4, target reps=8, target weight (např. 60/22.5/40/0/25).
- Uložit.
- ✅ Šablona se objeví v seznamu, vidím 5 cviků v daném pořadí, target hodnoty viditelné.
- ✅ Po hot-reload / restartu app šablona stále existuje.

### T1.3 Spuštění tréninku ze šablony
- V seznamu šablon tap "Push day" → "Spustit trénink".
- ✅ Vytvoří se nový workout s názvem "Push day", otevře se detail.
- ✅ Každý cvik má target_sets prázdných řádků s předvyplněnými reps a weight (60/8, 22.5/8, ...).
- ✅ Uživatel může reps/weight přepsat skutečnými hodnotami.

### T1.4 Editace šablony — reorder + úprava target
- V seznamu šablon tap "Push day" → "Upravit".
- Drag&drop přesun "Dips" před "OHP" (nebo move-up/down fallback šipky).
- Změnit target_weight u "Bench press" z 60 na 65.
- Smazat "Triceps pushdown".
- Přidat "Diamond push-ups" s target sets=3, reps=15, weight=null.
- Uložit.
- ✅ Změny perzistují, nový workout startovaný z této šablony má upravené hodnoty.
- ✅ Předchozí workout (T1.3) zůstává nezměněn (FR-004).

### T1.5 Smazání šablony
- V seznamu šablon long-press / akce "Smazat" → potvrdit.
- ✅ Šablona zmizí.
- ✅ Existující workouts vytvořené z této šablony zůstávají v Historii (FR-005); jejich `template_id` je teď NULL (ověřit přes Supabase Studio nebo přes Historii — workout je tam stále viditelný).

### T1.6 Rozpracovaný workout + start nové šablony
- Začni workout (ad-hoc nebo z šablony), nedokončuj ho (`finished_at = NULL`).
- Vrať se na šablony, tap "Spustit" na jiné šabloně.
- ✅ Vidím dialog se 3 možnostmi: Pokračovat v rozpracovaném / Zahodit a začít nový / Zrušit.

### T1.7 Smazaný cvik ze šablony
- (Pre-condition: admin smazal jeden cvik z `exercises` mezi vytvořením šablony a spuštěním — lze simulovat SQL DELETE v Studio.)
- Tap "Spustit" na šabloně která ten cvik měla.
- ✅ Workout se vytvoří s ostatními cviky, zobrazí se Toast "1 cvik byl odstraněn".

---

## US2 — Rest Timer (P1)

### T2.1 Auto-start po uložení série
- V aktivním workoutu zapiš reps + weight → tap "Uložit sérii".
- ✅ Rest timer se objeví nad další sérií, countdown 90:00.

### T2.2 Foreground notifikace (zvuk + haptika)
- Nech timer doběhnout v popředí.
- ✅ V 0:00 zazní zvuk a telefon zavibruje.
- ✅ Timer se schová / přepne na "Připraveno k další sérii".

### T2.3 Background push notifikace
- Spusť timer, přepni app na pozadí (home button) nebo zamkni telefon.
- Po 90 s počkej.
- ✅ Telefon dostane lokální push: title "Konec pauzy", body "Pokračuj v tréninku".

### T2.4 +15s
- Spusť timer, ve fázi remaining ~80 s tap "+15 s".
- ✅ Remaining stoupne o 15 s.
- ✅ Scheduled notifikace je přeplánovaná (test: pošli app na pozadí, dorazí o 15 s později).

### T2.5 Skip
- Spusť timer, tap "Skip".
- ✅ Timer zmizí, další série je okamžitě připravena k zápisu.
- ✅ Notifikace nedorazí.

### T2.6 Cold-start restore
- Spusť timer (90 s), force-kill app (swipe v task manageru) po ~30 s.
- Otevři app znovu.
- ✅ Rest timer pokračuje s remaining ~60 s.
- ✅ Při doběhu dorazí notifikace (na pozadí) / zvuk (popředí).

### T2.7 Cold-start s expirovaným timerem
- Spusť timer (90 s), force-kill app, počkej 120 s, otevři app.
- ✅ Rest timer se nezobrazí (FR-016).
- ✅ Žádný duplicitní zvuk.

### T2.8 OS notifikace zakázané
- V OS settings vypni notifikace pro Expo Go / Dev Build.
- Spusť timer poprvé v této session.
- ✅ Zobrazí se jednorázový dialog "Notifikace jsou zakázané... Otevřít nastavení".
- ✅ Timer dál funguje (foreground countdown, zvuk + haptika).
- ✅ Při background → no push, ale po návratu na foreground vidím správný stav.

### T2.9 Změna default délky
- Profile → Nastavení tréninku → změnit default rest na 120 s.
- Spusť novou sérii.
- ✅ Timer startuje na 2:00.

---

## US3 — Historie (P2)

### T3.1 Seskupení po dnech
- (Pre-condition: alespoň 5 dokončených workoutů ve 3+ různých dnech.)
- Otevři tab "Historie".
- ✅ Vidím sekce po datech (sestupně), v každé sekci karty workoutů.

### T3.2 Karta tréninku
- Pohled na 1 kartu.
- ✅ Zobrazuje: datum + čas, název, počet cviků, total volume (v preferred_unit s jednotkou), dobu trvání.

### T3.3 Detail tréninku
- Tap na kartu.
- ✅ Otevře se detail: per cvik seznam sérií (reps × weight v preferred_unit) + max weight.

### T3.4 Empty state
- (Pre-condition: nový účet bez workoutů.)
- ✅ Empty state + CTA "Začít první trénink".

### T3.5 Lazy load
- (Pre-condition: 100+ workoutů — lze seedovat SQL skriptem.)
- ✅ První obrazovka načte < 1 s.
- ✅ Scroll plynulý, ≥ 55 FPS (zkontrolovat Perf Monitor v Expo Dev Menu).
- ✅ Po dosažení dna se načte další stránka.

---

## US4 — Equipment filtr (P3)

### T4.1 Chips pod body_part filtrem
- Otevři exercise picker (přidání cviku do workoutu nebo šablony).
- ✅ Vidím druhou řadu chipů: Činka / Osa / Kabel / Stroj / Vlastní váha / Kettlebell / Bands / Žádné.

### T4.2 Single chip
- Tap "Činka".
- ✅ Seznam se zúží na cviky s mapováním → `dumbbell`.

### T4.3 Multi-select + AND s body_part
- Tap body_part "Hrudník" + equipment "Činka".
- ✅ Vidím prsní cviky s činkami.
- ✅ Přidej equipment "Stroj" → vidím prsní cviky s činkami NEBO stroji (v rámci equipment skupiny OR, mezi skupinami AND).

### T4.4 Reset
- Tap aktivní chip "Činka" znovu nebo "Vymazat".
- ✅ Filtr equipment se resetuje, vidím všechny cviky daného body_part.

### T4.5 Prázdná kombinace
- Body_part = "Lýtka" + Equipment = "Bands".
- ✅ Empty state "Zkus jinou kombinaci filtrů".

### T4.6 Null equipment
- Vyber chip "Žádné".
- ✅ Vidím cviky kde `equipment IS NULL` + mapování explicitně na `other` (např. `medicine ball`, `foam roll`).

---

## Globální (kg / lb preference)

### TG.1 Default = kg
- (Pre-condition: nový profil nebo `preferred_unit = 'kg'`.)
- ✅ Všechny weight UI hodnoty mají jednotku "kg".

### TG.2 Přepnutí na lb
- Profile → preferred_unit = "lb".
- ✅ Do 500 ms se všechny weight zobrazení přepnou na lb s konverzí.
- ✅ Zápis nové série v lb se uloží do DB v kg (ověřitelné v Supabase Studio: `SELECT weight_kg FROM workout_sets ORDER BY id DESC LIMIT 1`).
- ✅ Šablony, historie volume, rest timer detail — všechno v lb.

### TG.3 Konverze přesnost
- 60 kg má zobrazit jako "132.3 lb" (60 × 2.20462 ≈ 132.277, zaokr. 132.3).
- 100 lb se uloží jako 45.36 kg (100 / 2.20462 ≈ 45.359, zaokr. 2 desetinná místa per DB schema).

---

## Offline read (FR-052)

### TO.1 Šablony bez sítě
- Otevři app online, načti seznam šablon → vrať se na home.
- Aktivuj airplane mode.
- Znovu otevři "Šablony".
- ✅ Seznam je viditelný (z paměti / Supabase JS klient cache aktuální session).
- ✅ Detail šablony lze otevřít, target hodnoty se zobrazují.
- ⚠️ Vytvoření / editace šablony za offline může selhat — to je akceptovatelné (FR-052 garantuje jen read, ne write).

### TO.2 Historie bez sítě
- Otevři Historii online, projdi pár karet.
- Aktivuj airplane mode, vrať se zpět na historii.
- ✅ Předchozí načtené stránky historie zůstanou zobrazené, scroll funguje.
- ⚠️ `loadMore` může selhat → graceful: žádný crash, stačí toast / silent fail.

### TO.3 Rest timer bez sítě
- Spusť aktivní workout, ulož sérii, počkej na rest timer.
- ✅ Timer běží lokálně, push notifikace doručí OS bez sítě (notifikace je lokální, ne server-push).

---

## Regression check (SC-007)

- ✅ Ad-hoc workout (bez šablony) lze stále založit (Workouts → "Nový trénink").
- ✅ Existující nutrition / progress / profile flowy nejsou rozbité.
- ✅ Onboarding pro nový účet stále projde.
- ✅ Auth (login/register/logout) funguje.

---

## Sign-off kritéria

Sprint I je hotový, když:

1. Všechny T-cases výše projdou na iOS i Android (alespoň jedno reálné zařízení každé platformy).
2. `npx tsc --noEmit` projde bez chyb.
3. SC-001 — SC-008 ze spec.md jsou ověřitelné.
4. `DEV_DIARY.md` má záznamy o každém milestone.
5. Žádný broken build commit v gitu (per CLAUDE.md projektu).
