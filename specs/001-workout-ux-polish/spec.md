# Feature Specification: Workout UX Polish (Sprint I)

**Feature Branch**: `001-workout-ux-polish`

**Created**: 2026-05-19

**Status**: Draft

**Input**: User description: "Workout UX polish — Sprint I: historie tréninků po dnech, workout templates (uložené rutiny, Strong-style — uživatel vybírá ze svých šablon, který trénink ten den spustí), rest timer mezi sériemi, equipment filtr v exercise picker. Cíl: app použitelná denně bez třenic."

## Clarifications

### Session 2026-05-19

- Q: Equipment chip mapping pro neznámé/edge `equipment` hodnoty (`e-z curl bar`, `medicine ball`, `foam roll` apod.) z free-exercise-db → A: Explicitní lookup tabulka/config v kódu mapující raw hodnoty na 8 canonical chipů; nemapované hodnoty → "Žádné/Other".
- Q: Chování rest timeru, když uživatel zakáže notifikace v OS → A: Při prvním spuštění timeru detekovat permission status; pokud denied, zobrazit jednorázový dialog s odkazem do OS settings. Timer dál funguje (vizuál + zvuk/haptika v popředí), jen bez push notifikace na pozadí.
- Q: Persistence rozpracovaného rest timeru (start_timestamp + délka) → A: Lokálně only (AsyncStorage / SecureStore), per-device; žádná cloud sync. Přeinstalace app nebo přechod na jiné zařízení = ztráta aktuálního timeru (akceptovatelné, ephemeral state).
- Q: "Opakovat poslední trénink" (původní US4) — chování při existujícím rozpracovaném workoutu → A: Funkce zcela vyřazena ze scope tohoto sprintu. Uživatel pokryje use case přes Workout Templates (US1) — vytvoří si vlastní šablony (Push, Pull, Legs, Full body apod.) a vybírá z nich, podobně jako v "Strong" appce.
- Q: Canonical český text rest-timer notifikace (title / body) → A: Title: "Konec pauzy" / Body: "Pokračuj v tréninku".
- Q: Rozsah dat v šabloně — jen seznam cviků, nebo i target reps × kg? → A: Strong-style — šablona u každého cviku obsahuje target počet sérií, target reps a target weight; tyto hodnoty se použijí jako předvyplněné defaulty pro nový workout (uživatel je při běhu může přepsat).
- Q: Jednotka váhy v UI (historie volume, šablony, zápis sérií) → A: Storage canonical je vždy kg. V profilu uživatele lze nastavit preferred unit (kg / lb); UI hodnoty se zobrazují v této jednotce s on-the-fly konverzí. Default = kg. (Relevantní pro App Store launch s US/UK trhem.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Workout templates: uložené rutiny (Priority: P1)

Uživatel má 2–4 oblíbené rutiny ("Push day", "Pull day", "Legs day", "Full body"). Místo aby pokaždé znovu vybíral 6–10 cviků z 873cvičové databáze, klikne na šablonu a nový trénink se vytvoří s předvyplněnými cviky **v daném pořadí včetně target počtu sérií, target reps a target weight pro každý cvik** (Strong-style). Šablonu může pojmenovat, editovat (přidat/odebrat/přeskupit cviky, upravit target hodnoty) a smazat. Při běhu workoutu lze target hodnoty kdykoli přepsat.

**Why this priority**: Toto je největší časový úspor v daily use. Bez šablon trvá založení tréninku 1–2 minuty hledání v 873 cvicích, se šablonou ~3 sekundy. Strong/Hevy mají šablony jako základní feature a uživatel je explicitně zmínil ve VISIONS.md jako klíčovou inspiraci.

**Independent Test**: Lze plně otestovat tak, že uživatel vytvoří šablonu "Push day" s 5 cviky, zavře app, znovu otevře, klikne "Nový trénink z šablony → Push day" → vidí trénink s těmi 5 cviky v pořadí, připravený k zápisu sérií.

**Acceptance Scenarios**:

1. **Given** uživatel je na obrazovce Workouts a nemá žádné šablony, **When** klikne "Šablony", **Then** vidí prázdný stav s tlačítkem "Vytvořit šablonu".
2. **Given** uživatel je v editaci šablony, **When** přidá 5 cviků z exercise pickeru, u každého zadá target sets / target reps / target weight, zadá název "Push day" a uloží, **Then** šablona se objeví v seznamu šablon (včetně target hodnot) a perzistuje po restartu app.
3. **Given** uživatel má uloženou šablonu, **When** klikne na ni a zvolí "Spustit trénink", **Then** vytvoří se nový workout s předvyplněnými cviky v daném pořadí a u každého cviku má připravený target počet sérií s předvyplněnými reps a weight (uživatel jen potvrzuje / přepisuje skutečné hodnoty).
4. **Given** uživatel má šablonu, **When** ji edituje (přeskupí pořadí drag&drop, smaže 1 cvik, přidá 2 nové, upraví target hodnoty u existujícího cviku), **Then** změny se uloží a další spuštěné tréninky používají novou verzi.
5. **Given** uživatel chce šablonu smazat, **When** potvrdí smazání, **Then** šablona zmizí ze seznamu; **již existující** historické tréninky vytvořené z této šablony zůstanou nedotčené.

---

### User Story 2 - Rest timer mezi sériemi (Priority: P1)

Uživatel uloží sérii (reps + váha) a okamžitě se spustí countdown timer (default 90 s). Vidí zbývající čas velkými čísly, slyší zvuk/vibraci po uplynutí, případně dostane push notifikaci pokud má app na pozadí nebo zamčený telefon. Timer lze pozastavit, resetovat, prodloužit (+15 s) nebo přeskočit. Default délku lze měnit v nastavení.

**Why this priority**: Rest timer je používán **při každé sérii každého tréninku** (typicky 20–40× za trénink). Bez něj uživatel kouká na hodinky nebo počítá v hlavě, což je classic UX díra. Strong/Hevy mají timer jako vlajkovou funkci.

**Independent Test**: Lze otestovat samostatně i bez templates/history — uživatel založí ad-hoc trénink, přidá cvik, uloží sérii → vidí běžící countdown; po 90 s zazní zvuk + vibrace; klikne "+15 s" → odpočet pokračuje od +15 s.

**Acceptance Scenarios**:

1. **Given** uživatel zapisuje sérii v aktivním tréninku, **When** stiskne "Uložit sérii", **Then** rest timer se spustí na default hodnotu (90 s) a zobrazí se nad další sérií.
2. **Given** rest timer doběhne do 0, **When** je app v popředí, **Then** zazní zvuk a telefon zavibruje; **When** je app na pozadí nebo telefon zamčený, **Then** uživatel dostane lokální push notifikaci (title: "Konec pauzy", body: "Pokračuj v tréninku").
3. **Given** rest timer běží, **When** uživatel klikne "+15 s", **Then** zbývající čas se zvýší o 15 s.
4. **Given** rest timer běží, **When** uživatel klikne "Skip", **Then** timer zmizí a další série je okamžitě připravena k zápisu.
5. **Given** uživatel je v Nastavení → Trénink, **When** změní default rest na 120 s a uloží, **Then** příští série spustí timer na 120 s.

---

### User Story 3 - Historie tréninků po dnech (Priority: P2)

Uživatel má 2 měsíce dat (workouts + sets). Otevře záložku "Historie" a vidí seznam dokončených tréninků seskupený po dnech (chronologicky sestupně). Každá karta tréninku zobrazí datum, název (pokud má), počet cviků, total volume (kg × reps), dobu trvání. Klikem na kartu se otevře detail s rozpisem cviků a sérií. Lze listovat zpět minimálně 6 měsíců bez výkonových problémů.

**Why this priority**: Toto dokončuje **B6** z předchozího sprintu (jediný unfinished bod v Sprintu B). Uživatel ho potřebuje pro denní review ("co jsem cvičil minule?") a pro budoucí Statistics sprint (J — PR, volume trendy). Není daily-friction-killer jako šablony/timer, ale je to baseline funkce každé fitness app.

**Independent Test**: Lze otestovat samostatně — pokud existují alespoň 3 dokončené workouts napříč různými dny, na obrazovce Historie jsou viditelné, správně seskupené, řazené sestupně, a detail se otevírá.

**Acceptance Scenarios**:

1. **Given** uživatel má v DB 5 dokončených workouts ve 3 různých dnech, **When** otevře záložku Historie, **Then** vidí 3 sekce seskupené po datech (sestupně), v každé sekci karty pro dané workouts.
2. **Given** uživatel klikne na kartu tréninku z minulého týdne, **When** se otevře detail, **Then** vidí název, datum + čas, total volume, dobu trvání, seznam cviků s počtem sérií a max váhou.
3. **Given** uživatel nemá žádné dokončené tréninky, **When** otevře Historii, **Then** vidí prázdný stav s krátkým návodem a tlačítkem "Začít první trénink".
4. **Given** uživatel má v DB 100+ workouts, **When** otevře Historii, **Then** seznam se načte do 1 s a scroll je plynulý (lazy load / windowing).

---

### User Story 4 - Equipment filtr v exercise picker (Priority: P3)

Při výběru cviku do tréninku (nebo do šablony) vidí uživatel pod existujícím filtrem partie tela druhou řadu chipů s vybavením: Činka / Osa (barbell) / Kabel / Stroj / Vlastní váha / Kettlebell / Bands / Žádné. Klikem na chip se seznam zúží na cviky daného typu vybavení. Kombinuje se s filtrem partie (logické AND). Filtr je multi-select.

**Why this priority**: Velmi konkrétní zlepšení existujícího exercise pickeru (z Sprint H). Šetří čas při hledání mezi 873 cviky, ale samotné je to "polish" — uživatel se obejde s vyhledáváním podle jména nebo body_part. Nezasahuje do core flow.

**Independent Test**: Lze otestovat samostatně — uživatel otevře exercise picker, klikne na chip "Činka" → seznam se zúží jen na cviky s equipment='dumbbell'; přidá chip "Stroj" → vidí cviky s equipment IN ('dumbbell', 'machine'); kombinuje s body_part filtrem.

**Acceptance Scenarios**:

1. **Given** uživatel je v exercise pickeru, **When** klikne na equipment chip "Činka", **Then** se zobrazí jen cviky s equipment 'dumbbell'.
2. **Given** uživatel má aktivní filtr body_part='Hrudník' a equipment='Činka', **When** prochází seznam, **Then** vidí jen prsní cviky s činkami.
3. **Given** uživatel zruší všechny equipment chipy, **When** se seznam přerenderuje, **Then** vidí všechny cviky daného body_part (původní chování).
4. **Given** některý equipment typ nemá v DB žádný cvik dané partie, **When** uživatel zvolí kombinaci, **Then** vidí prázdný stav s nápovědou "Zkus jinou kombinaci filtrů".

---

### Edge Cases

- **Restart app v polovině rest timeru**: Po cold-start má timer pokračovat / dopočítat zbývající čas (perzistence start timestamp). Pokud uplynul méně než plánovaný interval, dopočítá zbylý čas; jinak se nezobrazí.
- **Smazání cviku ze šablony, který už neexistuje v DB**: Šablona obsahuje exercise_id, který byl smazán. Při spuštění šablony tento cvik vynech a zobraz toast "1 cvik byl odstraněn (přestal existovat)".
- **Velká šablona (>20 cviků)**: UI musí zvládnout; upozornění "šablony obvykle mívají 5–10 cviků" je optional.
- **Background rest timer + dead battery / killed app**: Push notifikace musí být naplánovaná **lokálně** (Expo scheduled local notification) v okamžiku spuštění timeru, aby fungovala i bez běžící app.
- **Equipment hodnota null v DB**: 873 cviků z free-exercise-db nemá vždy vyplněné equipment. Cviky s NULL equipment patří do skupiny "Žádné / vlastní váha" pro účely filtrace.
- **OS notifikace zakázané pro app**: Při prvním spuštění rest timeru systém detekuje permission status; pokud denied, zobrazí jednorázový dialog s odkazem do OS settings. Timer dál běží (vizuál + zvuk/haptika v popředí), jen push notifikace na pozadí selže tiše.
- **Více aktivních tréninků současně**: Pokud je rozpracovaný workout a uživatel klikne "Spustit z šablony", upozornit "Máš rozpracovaný trénink — pokračovat / zahodit a začít nový?".

## Requirements *(mandatory)*

### Functional Requirements

**Workout templates (US1)**

- **FR-001**: Systém MUSÍ umožnit uživateli vytvořit, pojmenovat, editovat a smazat šablonu tréninku (workout template) obsahující uspořádaný seznam cviků.
- **FR-002**: Šablona MUSÍ patřit jednomu uživateli (uživatel A nevidí šablony uživatele B); platí stejná RLS pravidla jako pro existující workouts.
- **FR-003**: Systém MUSÍ umožnit uživateli spustit nový workout ze šablony jediným potvrzením; nový workout obsahuje cviky v daném pořadí a u každého cviku target počet sérií předvyplněných hodnotami target reps a target weight ze šablony. Uživatel může předvyplněné hodnoty kdykoli při běhu workoutu přepsat.
- **FR-008**: Každý cvik v šabloně MUSÍ ukládat: target_sets (int ≥ 1), target_reps (int ≥ 1), target_weight_kg (numeric ≥ 0, nullable pro bodyweight cviky). Hodnoty platí uniformně pro všechny série daného cviku v rámci šablony (per-set varianty mimo scope tohoto sprintu).
- **FR-009**: Storage váhy MUSÍ být vždy v kanonické jednotce kg (FLOAT/numeric). Veškeré UI vstupy/výstupy konvertují mezi kg a preferred unit uživatele (per FR-053) on-the-fly; v DB se hodnoty v jiné jednotce neukládají.
- **FR-004**: Editace šablony NESMÍ retroaktivně měnit historické workouts vytvořené ze starší verze šablony.
- **FR-005**: Smazání šablony NESMÍ smazat ani změnit historické workouts; pole odkazující na šablonu se osamostatní (set NULL / mark detached).
- **FR-006**: Počet šablon na uživatele MUSÍ být neomezený (žádné premium-style limity v MVP — viz VISIONS.md, "šablony neomezíme").
- **FR-007**: Šablona MUSÍ podporovat reorder cviků (drag&drop nebo move up/down).

**Rest timer (US2)**

- **FR-010**: Systém MUSÍ automaticky spustit rest timer po uložení každé série, s default trváním 90 s.
- **FR-011**: Uživatel MUSÍ moci timer pozastavit, resetovat, prodloužit o +15 s, nebo přeskočit (skip).
- **FR-012**: Po doběhnutí timeru MUSÍ systém přehrát zvukovou notifikaci a spustit haptickou odezvu, pokud je app v popředí.
- **FR-013**: Systém MUSÍ naplánovat lokální push notifikaci tak, aby uživatel byl upozorněn i při zamčeném telefonu nebo app na pozadí. Texty: title = "Konec pauzy", body = "Pokračuj v tréninku".
- **FR-014**: Uživatel MUSÍ moci nastavit default délku rest timeru v profilu/nastavení (per-user globální hodnota, persistovaná).
- **FR-015**: Po cold-startu app, pokud rest timer ještě reálně neuplynul (now − start_timestamp < trvání), systém MUSÍ obnovit countdown na zbývající hodnotu. Start_timestamp a délka MUSÍ být uloženy **lokálně** (AsyncStorage / SecureStore) per-device; žádná cloud sync. Přeinstalace app nebo přechod na jiné zařízení znamená ztrátu rozpracovaného timeru (akceptovatelné, ephemeral state).
- **FR-016**: Pokud rest timer mezitím doběhl během cold-startu, systém ho NESMÍ znovu zobrazovat ani znovu přehrávat zvuk.
- **FR-017**: Při prvním spuštění rest timeru v dané instalaci MUSÍ systém zjistit permission status pro lokální notifikace. Pokud je status `denied`, MUSÍ zobrazit jednorázový dialog vysvětlující dopad a nabízející tlačítko otevírající OS settings dané platformy. Dialog se NESMÍ opakovat v rámci stejné session ani opakovaně blokovat běh timeru.
- **FR-018**: I při zakázaných OS notifikacích MUSÍ rest timer plnit core funkci: vizuální countdown, zvuk a haptická odezva v popředí (per FR-012). Pouze push notifikace pro pozadí/zamčený telefon (per FR-013) v takovém případě nefunguje.

**Historie (US3)**

- **FR-020**: Systém MUSÍ zobrazit seznam dokončených workouts (finished_at IS NOT NULL) seskupený podle data (lokální časová zóna uživatele), řazený sestupně.
- **FR-021**: Karta workoutu v historii MUSÍ zobrazit datum + čas, název (pokud existuje), počet cviků, počet sérií, total volume (Σ reps × weight) a dobu trvání (finished_at − started_at). Volume i weight se zobrazují v preferred unit uživatele (kg/lb per FR-053); jednotka MUSÍ být explicitně viditelná u hodnoty (např. "12 480 kg" / "27 510 lb").
- **FR-022**: Detail workoutu v historii MUSÍ zobrazit per-cvik seznam sérií (reps × weight v preferred unit) a maximum weight v rámci tréninku.
- **FR-023**: Seznam MUSÍ podporovat lazy load / paginaci tak, aby první obrazovka načetla nejvýše 30 nejnovějších workouts.
- **FR-024**: Při prázdném stavu (žádné dokončené workouts) MUSÍ systém zobrazit explicitní empty state s CTA "Začít první trénink".

**Equipment filtr (US4)**

- **FR-040**: Exercise picker MUSÍ pod existující řadou body_part filtrů zobrazit druhou řadu equipment chipů s těmito hodnotami: Činka (dumbbell), Osa (barbell), Kabel (cable), Stroj (machine), Vlastní váha (body only), Kettlebell, Bands, Žádné/Other.
- **FR-041**: Equipment filtr MUSÍ být multi-select; kombinace s body_part filtrem MUSÍ být logické AND (cvik musí splnit obě skupiny).
- **FR-042**: Cviky s NULL equipment hodnotou MUSÍ být zařazeny do skupiny "Žádné/Other".
- **FR-044**: Systém MUSÍ obsahovat explicitní lookup mapping (config v kódu nebo lookup tabulka) převádějící raw hodnoty `exercises.equipment` na 8 canonical chipů (Činka, Osa, Kabel, Stroj, Vlastní váha, Kettlebell, Bands, Žádné/Other). Hodnoty bez explicitního mapování MUSÍ být zařazeny do skupiny "Žádné/Other". Mapping MUSÍ být dohledatelný a snadno rozšiřitelný bez změny UI kódu.
- **FR-043**: Zvolené filtry MUSÍ persistovat pouze v rámci jedné session exercise pickeru (po zavření a opětovném otevření se resetují).

**Obecné**

- **FR-050**: Veškeré UI texty MUSÍ být v češtině (konzistentně s existující app).
- **FR-051**: Všechny nové DB tabulky a sloupce MUSÍ mít Row Level Security politiku omezující přístup na vlastníka záznamu (auth.uid() = user_id).
- **FR-052**: Žádná z nových funkcí NESMÍ vyžadovat přístup k internetu po prvním načtení dat (offline-friendly read; konzistentní s offline-first mindset z VISIONS.md).
- **FR-053**: Profil uživatele MUSÍ obsahovat pole `preferred_unit` typu enum (`kg` / `lb`), default `kg`. Pole MUSÍ být nastavitelné v Nastavení → Trénink (nebo Profil). Změna preference se MUSÍ okamžitě projevit ve všech UI místech zobrazujících váhu (zápis sérií, šablony, historie, volume) bez nutnosti restartu app.
- **FR-054**: Konverze mezi kg a lb MUSÍ používat standardní koeficient 1 kg = 2.20462 lb; zobrazené hodnoty se zaokrouhlují na 1 desetinné místo (např. 60 kg → 132.3 lb).

### Key Entities

- **WorkoutTemplate**: Uložená rutina patřící jednomu uživateli. Atributy: name, created_at, updated_at, owner (user_id). Vztah 1:N k TemplateExercise.
- **TemplateExercise**: Položka šablony — odkaz na cvik, pořadí v šabloně a target hodnoty pro běh workoutu. Atributy: template_id, exercise_id, order_index, target_sets (int ≥ 1), target_reps (int ≥ 1), target_weight_kg (numeric ≥ 0, nullable pro bodyweight). Při spuštění workoutu se z těchto target hodnot vygeneruje target_sets prázdných řádků sérií s předvyplněnými reps/weight (uživatel je při běhu přepisuje skutečnými hodnotami).
- **UserPreferences** (rozšíření existujícího `profiles`): default_rest_seconds (int, default 90), preferred_unit (enum `kg` / `lb`, default `kg`). Per-user globální nastavení; ovlivňují UI rest timeru a zobrazení váhy napříč celou app.
- **WorkoutTemplateLink** (volitelný atribut na existujícím `workouts`): nullable reference na šablonu, ze které byl workout vytvořen — pro analytiku ("ze které šablony cvičí uživatel nejčastěji"). Při smazání šablony se link nastaví na NULL.
- **EquipmentFacet** (čistě UI/derived, ne DB): explicitní lookup mapping z raw `exercises.equipment` hodnot na 8 canonical chip kategorií (Činka, Osa, Kabel, Stroj, Vlastní váha, Kettlebell, Bands, Žádné/Other); nemapované raw hodnoty se zařadí do "Žádné/Other".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Spuštění nového tréninku z existující šablony zabere uživateli pod 5 sekund (od kliknutí na šablonu po první sérii k zápisu), oproti dnešním ~60 s při ručním výběru cviků.
- **SC-002**: 95 % rest-timer notifikací (zvuk i lokální push) zazní do 1 s od skutečného doběhnutí intervalu, měřeno na cílových zařízeních (iOS + Android).
- **SC-003**: Načtení obrazovky Historie s 200 dokončenými workouts proběhne pod 1 s na referenčním zařízení; scroll FPS ≥ 55.
- **SC-004**: Po 4 týdnech od release má alespoň 1 šablonu uloženou ≥ 70 % aktivních uživatelů (tj. takových, kteří dokončili ≥ 3 workouts).
- **SC-005**: Equipment filtr zmenší počet zobrazených cviků v pickeru o průměrně ≥ 70 % oproti zobrazení bez filtru (měřeno na typických single-equipment sessions: jen činky / jen stroje).
- **SC-006**: Subjektivní hodnocení "Cítím, že app je rychlejší na denní použití" ≥ 8/10 u beta-testerů (já + kamarádka trenérka) po 1 týdnu používání.
- **SC-007**: Žádný regression v existujícím flow (založení ad-hoc tréninku bez šablony stále funguje a netrvá déle než dnes).
- **SC-008**: Změna `preferred_unit` v nastavení (kg → lb nebo opačně) se projeví ve všech zobrazeních váhy do 500 ms bez restartu app; v DB zůstávají hodnoty v kanonickém kg (ověřitelné SQL dotazem).

## Assumptions

- **Stack zachován**: Expo SDK 54 + Supabase + Expo Router; žádná změna DB enginu ani auth modelu (potvrzeno z PROJECT_PLAN.md).
- **Notifikace**: Lokální push notifikace přes Expo Notifications jsou postačující pro rest timer; server push není potřeba (žádná závislost na backendu).
- **Šablony privátní**: Šablony jsou per-user, žádné sdílení s ostatními uživateli ani veřejná galerie (couple/trainer sharing je explicitní mimo scope tohoto sprintu — viz VISIONS.md 5 + 15.5).
- **Žádný premium gating**: V MVP žádné limity počtu šablon ani prémiové funkce (konzistentní s VISIONS.md odmítnutím Strong-style omezení šablon).
- **Default rest 90 s** jako industry-standard kompromis (Strong, Hevy mají také 90 s default).
- **Existující exercise DB** (`exercises` tabulka, 873 záznamů ze Sprintu H) má vyplněné pole `equipment` u většiny záznamů; NULL hodnoty jsou očekávaná menšina a mapují se do "Žádné/Other" skupiny.
- **Tracking volume** = Σ (reps × weight_kg) interně v DB; pro displej v historii se hodnota konvertuje do preferred unit uživatele (per FR-053). RPE / strength standards / percentil počká na Sprint J.
- **Per-set target varianty** (warmup sets s nižší vahou, drop sets, pyramid sety) jsou mimo scope tohoto sprintu — šablona má per-cvik uniformní target_sets/target_reps/target_weight. Bohatší per-set struktura počká na pozdější sprint.
- **Konverze kg ↔ lb** je čistě display layer (UI). DB schema používá kanonické kg pole, žádné duplicitní lb sloupce; konzistentní s tím, že preference uživatele může změnit ale historická data zůstávají integral.
- **Historie zpětně dostupná pro 100 % existujících workouts** — žádná migrace dat, čte z existujících tabulek (workouts + workout_sets + exercises).
- **Drag & drop reorder cviků v šabloně** je preferovaný UX, ale "move up / move down" tlačítka jsou akceptovatelný fallback.
- **Sound + haptic feedback** přes standardní `expo-av` + `expo-haptics`; nepředpokládá se vlastní native modul.
- **Mimo scope**: predikce sérií podle posledního tréninku, PRs/strength standards (Sprint J), couple/trainer template sharing (budoucí sprint).
