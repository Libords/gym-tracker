# VISIONS.md — Vize a nápady pro GymTracker

Tento dokument shrnuje Liborovy vize, nápady a požadavky na GymTracker appku.
Vychází z brainstormingu z 2026-05-17 (sessions `ec4ff0e8` + `6f4bc928`).
Účel: zachovat původní myšlenky v čitelné podobě, aby se neztratily ani okrajové nápady při dalším plánování.

---

## 1) Filosofie a celkový záměr

- **Vše v jedné appce.** Workout tracking, jídelníček, vzdělávání a trainer-client management mají být v jednom místě, ne ve třech různých appkách.
- **Pro mě napřed, App Store potom.** Aplikaci stavím nejdřív pro sebe a kamarádku trenérku — všechno mám zdarma. Až ji nasadím na App Store, budou tam standardní free/premium funkce po vzoru ostatních appek.
- **Žádný yes-man.** Claude nemá odsouhlasit každý můj nápad. Když je něco nesmyslné nebo se to dá udělat lépe, chci to slyšet a opravit.
- **Vše bezpečně.** Žádný únik dat, žádné odhalené tokeny, žádné riskantní operace bez schválení. Vždy dle nejlepších bezpečnostních praktik.

---

## 2) Workout tracking — co potřebuju

### Inspirace
- **Strong** — líbí se mi UX: rychlý zápis opakování a váhy po každé sérii, široký výběr cviků, ukládání tréninků jako šablon (na příštím tréninku už mám předvyplněné cviky → šetří čas). Lze uložit víc šablon, takže jich mám připravených několik.
- **FitNotes** — chválena za přehledný progress v čase (jestli se cvičenec zlepšuje).
- **Strength standards / percentily** — některé appky umí vyhodnotit, jak je cvičenec pokročilý a kam patří v porovnání s ostatními (síla na partii, %ile vs. ostatní uživatelé).

### Co od appky chci
- Rychlý zápis série (reps + váha) bez zbytečných kliků.
- Velká databáze cviků.
- Šablony tréninků s předvyplněnými cviky — opakování bez znovu-výběru.
- Progress grafy v čase: vývoj váhy na cviku, objem, výkony.
- Klasifikace pokročilosti / porovnání s ostatními cvičenci (síla po partiích, percentily dle váhy/věku/pohlaví).

---

## 3) Jídelníček a makra

### Inspirace
- **Dine4fit** (dříve "Kalorické tabulky") — skvělá CZ databáze potravin a restaurací, ruční zadávání.
- **MyFitnessPal** — používá to hodně lidí, taky funguje.
- **AI foto kalorií** — některé appky umí z fotky jídla odhadnout makra a kalorie (rychlejší, méně přesné).

### Co od appky chci
- Záložka/sekce pro denní zápis jídel — podobně jako dine4fit.
- Vyplňování jídel po dnech, ideálně rozdělené po jídlech (snídaně/oběd/večeře/svačiny).
- Tracking maker (B/S/T) a kalorií.
- **AI foto** jako alternativa k ručnímu zadávání — vyfotit jídlo, AI udělá odhad. Obě varianty (manuální i AI) k dispozici.
  - Pozn.: do MVP nemusí být, ale architektura má počítat s tím, že se to později přidá.
- Synchronizace s Garmin / Apple Watch / Strava — srdeční tep, kroky, kalorický výdej. **Není priorita pro MVP**, ale je to v plánu.

---

## 4) Vzdělávací sekce

### Co chci
- Sekce s informacemi: které suplementy mají smysl, které jsou zbytečné, jaké cviky jsou kvalitní, které naopak nebezpečné nebo neefektivní.
- **Science-based přístup** — opřené o studie a zkušenosti, ne broscience.
- Forma: odkazy na externí kvalitní zdroje (články z webů, YouTube videa).
- **Kurátorský princip** — buď já, nebo mnou natrénovaný model schvaluje každý zdroj. Žádný spam, jen ověřené informace.
- Postupně by se k externím odkazům přidávaly vlastní články.

### Vedlejší užitek: monetizace
- Skrz vzdělávací sekci by šly **affiliate odkazy** na produkty (suplementy, vybavení).
- Toto by zároveň částečně suplovalo funkci komunity (lidé tam najdou tipy, ale ne diskusi).

---

## 5) Trainer-client feature

- Kamarádka je trenérka a má klientky, pro které vytváří jídelníčky.
- Chci, aby trenérka měla **nadřazený účet** s přístupem ke svým klientkám.
- Trenérka nastaví jídelníček klientce → klientka se přihlásí do své appky a vidí ho.
- Toto je důležitá funkce, ne nice-to-have — kamarádka je můj první "B2B zákazník".

---

## 6) Pomocný AI chatbot (uvnitř appky)

- Chatovací okno, kde se uživatel může zeptat AI, jak appku používat, kde co najde, jak něco zaznamenat atd.
- AI by uživateli pomohla se vším, co potřebuje vyřešit uvnitř appky.
- **Není priorita pro MVP** — přidaná hodnota v early stage není jasná a Claude API stojí peníze. Ke zvážení v Phase 2/3.

---

## 7) Komunita

- Původně jsem zvažoval okno pro komunitu — lidé by si radili a předávali tipy.
- **Po diskuzi zamítnuto pro Phase 1+2.** Reddit a FB skupiny to dělají lépe, navíc by to znamenalo obrovský overhead (moderace, GDPR, spam).
- Pravděpodobně přidat někdy v budoucnu, ale ne hned.
- Funkci komunity může částečně suplovat vzdělávací sekce s kurátorovaným obsahem.

---

## 8) Monetizace — co zvažuju

### Základ
- **Free tier** — všechny základní funkce zdarma, aby měl uživatel důvod appku používat.
- **Premium** — odemkne pokročilé funkce.
  - Konkrétní limity ještě nestanoveny; cíl: neudělat to tak omezující, aby se lidé naštvali (Strong omezuje šablony na 3 → uživatelé to nenávidí → my šablony neomezíme).

### Trenér účty (B2B)
- Trenér si platí měsíční / roční licenci za správu klientů.
- Levnější alternativa k ABC Trainerize (49–129 $/měs.) — tam je díra na trhu pro menší trenéry.

### Affiliate
- Odkazy na produkty (suplementy, vybavení, fitness produkty) ve vzdělávací sekci.
- Pasivní příjem, ale jen kvalitní produkty (kurátorováno).

### Otevřené nápady k dořešení
- Zajímalo by mě, **jaké další možnosti monetizace existují** kromě premium + affiliate. Pokud existují další smysluplné cesty, chci je zvážit.

---

## 9) Synchronizace s wearables a dalšími službami

- Garmin / Apple Watch / Strava — propojení pro srdeční tep, kroky, kalorie.
- **Není MVP.** Až bude solidní core.

---

## 10) Profil uživatele

- V profilu uživatele mají být **jak jídelníčky a kalorie, tak i tréninky** — vše pohromadě.
- Synchronizace s wearables (viz výše) — data z hodinek do profilu.

---

## 11) UX rozhodnutí

- **Není to moc funkcí pro jednu appku?**
  - Po diskuzi: ne, ale je třeba rozumně rozdělit UI.
  - Řešení: bottom tab navigation s logickým rozdělením sekcí (workout / jídelníček / progress / atd.) — uživatel se mezi nimi přepíná, nemá vše namačkané do jedné obrazovky.
- Důraz na **rychlost zápisu** (Strong-like UX).
- **Offline-first mindset** — UI musí fungovat bez internetu.

---

## 12) Pracovní preference (jak se mnou Claude má pracovat)

Toto nejsou požadavky na appku, ale na **workflow**. Vznikly při brainstormingu, takže patří sem, aby se nezapomněly.

- **Říkej mi paralelní session.** Když je něco, co můžu dělat současně ve více oknech Claude Code (např. spec-kit fáze + paralelní research), chci to slyšet — co spustit v jedné, co ve druhé. Šetří čas.
- **Hlásit potřebu Opus.** Když je úkol, kde Sonnet/Haiku nebude stačit a Opus by dal výrazně lepší výsledek, řekni mi to a já přepnu.
- **Zvukové signály.**
  - Dokončení úkolu (čekáš na další prompt) → jeden zvuk.
  - Žádost o schválení (permission prompt) → jiný zvuk.
  - Cíl: poznám podle zvuku, jestli máš jen výsledek nebo potřebuješ moji pozornost.
- **Spec-kit workflow.** Používáme `/speckit.specify` → `clarify` → `plan` → `tasks` → `analyze` → `implement`. Každá fáze ideálně v nové session.

---

## 13) Provozní detaily (rozhodnuté)

- **Supabase účet** — vytvořen na soukromý email (lze měnit později pokud bude potřeba projekt předat).
- **Tech stack** (potvrzeno) — Expo SDK 54 + TypeScript + Supabase + Expo Router + StyleSheet (NativeWind zamítnut).
- **Jazyky** — UI česky, kód a commity anglicky.

---

## 14) Otevřené otázky / k diskuzi

- **Další monetizační kanály** — kromě premium + B2B trenéři + affiliate (viz #8). Konkrétní nápady?
- **Strength standards data** — kde brát zdrojová data pro percentily? (IPF/USAPL závody + logging platformy → desítky tisíc 1RM záznamů.)
- **AI foto kalorií** — vlastní řešení vs. integrace existující služby (SnapCalorie, Cal AI, MacroFactor mají API/SDK?).
- **Edukační content pipeline** — kdo bude kurátorovat (já vs. trénovaný model)? Jak řešit, když odkaz na externí web přestane existovat?

---

## Zdroj dat

Tento dokument je rekonstruován ze dvou Claude Code sessions z 2026-05-17:
- `ec4ff0e8-1419-4520-bfca-815e4e34969a` (19:10–20:53, primárně setup a brainstorm)
- `6f4bc928-d53a-4caa-a4e2-db0b23fcded6` (20:52–21:21, primárně spec-kit setup pro Sprint A)

Pozn.: pokud existují další vize z chatu na druhém PC (2026-05-18), které nejsou pushnuté do gitu, **v tomto dokumentu chybí**. Doplnit po sync z druhého PC.

---

## 15) Brainstorming z 2026-05-18 (druhý PC, session `2cae6f6c-1590-40ce-8839-0ada10a9370d`)

Tyto myšlenky vznikly při práci na Sprintech C–G (mikronutrienty, cyklus, onboarding, BMR/TDEE). Některé jsou už **implementované** (✅), jiné jsou stále **otevřené vize** (🔜) pro budoucí sprinty.

### 15.1 Onboarding + biometrika — ✅ HOTOVO

- Při registraci nasbírat: pohlaví, rok narození, výška, váha, cílová váha, aktivita v práci, frekvence/délka/typ tréninku.
- App z toho spočítá **BMR** (Mifflin-St Jeor) a **TDEE** (NEAT + tréninkové kalorie) a navrhne kalorický + makro cíl.
- Cíle nejsou hardcoded — všude v UI se taháme přes `profile.calorie_goal` / `protein_goal_g` / `carbs_goal_g` / `fat_goal_g`.
- 5-krokový wizard s gating přes `onboarding_done` flag.

### 15.2 Cyklus partnerky pro muže — ✅ HOTOVO (datově)

**Vize:** Muž ve vztahu může v profilu zapnout `has_partner_cycle` a začne sledovat cyklus partnerky. Cíl: pochopit, v jaké fázi je → mood, energie, co plánovat společně, čeho se zdržet, jak ji podpořit.

- DB: `cycle_logs.is_partner: boolean` — stejná tabulka, oddělené záznamy.
- UI: pro ženu = záložka "🌙 Cyklus" (osobní), pro muže = "💑 Partnerka" (jen pokud `has_partner_cycle=true`).
- Data: `PARTNER_PERSPECTIVE` pro každou ze 4 fází obsahuje `moodNote`, `supportTips[]`, `togetherActivities[]`, `avoid`.

**Pozn.:** zatím muž zapisuje cyklus partnerky **sám ručně**. Plné propojení (žena má taky účet a sdílí data) je téma pro 15.5.

### 15.3 Mikronutrienty z USDA — ✅ HOTOVO

- 18 mikronutrientů (vitamíny A/C/D/E/K, B1-B12, minerály: vápník, železo, hořčík, zinek, draslík, sodík, fosfor).
- Open Food Facts = primární zdroj (rychlé vyhledání, barcode), USDA FDC = enrichment mikronutrienty.
- `MicronutrientsCard`: % DDD (EU reference values), barevné kódování ≥100%/≥50%/≥20%/0%.
- Tab "Mikronutrienty" v Výživa screenu.

### 15.4 Fotky progresu — záměrně VYNECHÁNO

- Původně v plánu (D5), ale **odstraněno**.
- Důvod: uživatelé chtějí mít fotky ve své vlastní galerii (iCloud/Google Photos), ne v aplikaci.
- App nesleduje fotky, sleduje jen váhu + míry.

### 15.5 🔜 Sdílení dat mezi propojenými účty (couple linking)

**Stav:** vize, neimplementováno.

**Idea:** Žena má svůj účet, sleduje si osobní cyklus. Muž má svůj účet, požádá ji o propojení (něco jako QR / invite kód). Po schválení vidí muž v záložce "💑 Partnerka" živá data z jejího účtu — nemusí je sám ručně přepisovat.

**Otevřené otázky k řešení:**
- Privacy: žena musí přesně vidět, co muž vidí (jen fáze? + symptomy? + nálada?). Granularita.
- Co se sdílí: cyklus ano, váha/jídelníček/tréninky pravděpodobně **ne** (separation of concerns).
- Implementace: nová tabulka `partner_links` (user_a, user_b, status, permissions JSON), supabase RLS na cycle_logs musí podporovat čtení i propojenému uživateli.
- Revokace: jednostranně, okamžitě.

**Návaznost na trainer-client (#5):** Stejný princip propojení účtů, ale jiná role.

### 15.6 🔜 Push notifikace

**Stav:** vize, neimplementováno (F3 v PROJECT_PLAN).

**Idea — kontextové notifikace:**
- **Trénink:** pokud `training_days_per_week=4` a uživatel měl trénink před 2 dny → "Dnes je čas na trénink 💪" (chytré, ne dogmatické).
- **Jídelníček:** ráno "Nezapomeň zalogovat snídani 🥐", pokud do 11h není snídaně.
- **Váha:** týdně neděle ráno "Změř se a zaznamenej váhu ⚖️".
- **Cyklus (žena):** den před očekávanou menstruací "Připravuj se 🌸 — zítra začíná období". 1–2 dny do ovulace "Top forma na trénink 🔥".
- **Cyklus (muž, partner mode):** "Partnerka má dnes začátek luteální fáze — bude pravděpodobně unavenější, naplánuj klidný večer 🌙".

**Tech:** Expo Notifications + scheduled local notifications, žádný server push (pro MVP).

### 15.7 🔜 AI doporučení tréninků a stravy

**Stav:** vize, neimplementováno (backlog).

**Idea:** Claude API analyzuje uživatelská data (poslední 4 týdny tréninků, váhy, jídelníčku, cyklu) a navrhne:
- Adjustment makro cílů (pokud váha neklesá/neroste podle target → upravit kcal o ±100).
- Tréninkový plán na další týden (podle frekvence + cyklu u žen).
- Recepty / jídla podle chybějících mikronutrientů ("Tento týden máš málo železa — doporučuju toto").

**Pozn.:** Claude API stojí peníze, takže buď premium feature, nebo rate-limited (1× týdně).

### 15.8 🔜 Comprehensive exercise DB — ✅ HOTOVO ve Sprintu H

- 873 cviků z `free-exercise-db` (yuhonas/free-exercise-db, public domain).
- Filtry podle body_part, equipment, target muscle.
- Detail cviku: instrukce, sekundární svaly, GIF URL.
- Vlastní cviky (`is_custom=true`) zachovány.

### 15.9 🔜 Sdílení dat skrze sociální síť (future)

**Stav:** dlouhodobá vize, ne pro phase 1+2.

- Friends system uvnitř appky — kamarádi vidí navzájem progress, motivují se.
- Sdílení tréninků jako "stories" (Strava-style).
- Soutěže (kdo má víc volume tento týden, nejdelší streak).
- **Kolize s #7 Komunita (zamítnuto):** tento koncept je jiný — ne "veřejné diskuze", ale uzavřené přátelské skupiny (5-10 lidí). Méně overhead na moderaci.

---

## Zdroj dat — pokračování

- `2cae6f6c-1590-40ce-8839-0ada10a9370d` (2026-05-18, druhý PC) — Sprint C–G, mikronutrienty, cyklus partnerky, BMR/TDEE, onboarding, spec-kit instalace.
- Pokračování práce v session z 2026-05-19 (současný chat) — Sprint H Exercise DB + VISIONS update.

---

## 16) Vize z 2026-05-21 / 2026-05-22 (testing Sprintu I)

Tyto úvahy vznikly při prvním procházení appky v Expo Go po dokončení Sprintu I (Workout UX Polish).

### 16.1 🔜 UX restrukturalizace — top-level navigace (Sprint J kandidát)

**Stav:** spec finalizovaná 2026-05-22, neimplementováno. Bude vlastní sprint.

**Problém:** Aktuální flat bottom-tab navigace (Přehled / Tréninky / Výživa / Progress / Profil) má moc záložek vedle sebe a míchá příliš odlišné kontexty.

**Cílový layout (rozhodnuto):**
- **Hamburger / drawer vlevo nahoře** — permanentně viditelné „tři čárky" na všech screens. Po kliknutí vyjede z levé strany side drawer.
- **Drawer obsah** (mode picker, finální seznam TBD): Domů (přehled), Trénink, Jídelníček, Progress, Profil, Vzdělávání (placeholder pro budoucí edukativní hub). Postupně dodáme i Nastavení, Pomoc atd.
- **Per-mode bottom tabs** — max **5 tlačítek** per mode, kontext-specific. Příklad:
  - **Trénink**: Dnes / Šablony / Historie / Cviky
  - **Jídelníček**: Dnes / Historie / Vyhledat / Statistiky
  - **Progress**: Váha / Míry / (Cyklus jen pro ženy s opt-in)
- **Domovská stránka** — landing po otevření appky, neutrální „přehled". Obsah TBD: progres / statistiky / kalendář tréninků / cesta uživatele. Doladí se v rámci sprintu.
- **Back navigation** — standardní iOS swipe right-to-left (`gestureEnabled` na Stack screens). Drawer se otevírá swipe-from-left.
- **Safe area** — všechny screens musí respektovat safe area (Dynamic Island / status bar / home indicator). Drobnou opravu pro stávající screens dodáno 2026-05-22 (SafeAreaProvider + SafeAreaView edges=['top']).

**Technicky:**
- `expo-router/drawer` pro drawer navigátor.
- Refaktor route struktury: `app/(app)/_layout.tsx` přejde z Tabs na Drawer, uvnitř každý mode = vlastní Tabs layout (`app/(app)/(training)/_layout.tsx` atd.). Nebo zachování flat layoutu s vlastní drawer komponentou — k rozhodnutí v Sprint J specifikaci.
- Custom header s hamburger ikonou (Ionicons `menu-outline`) — pravděpodobně `react-native-drawer-layout` + custom header komponenta, ne expo-router default header.

**How to apply:** Vlastní sprint (Sprint J), spustit `/speckit.specify` po dokončení Sprint I cleanupu (16.5 retest po reload, případné rezidualní bugy). Reference layoutu: standardní mobile drawer pattern à la Gmail / Notion / většina enterprise mobile apps.

### 16.2 🔜 Onboarding 2.0 — science disclaimer + přesnější makra

**Stav:** vize, neimplementováno. Podrobnosti viz [`memory/feedback_nutrition_messaging.md`](.../memory/feedback_nutrition_messaging.md).

**Klíčové body:**
- **Surplus pro nabírání** je nutné odlehčit — novější studie a praxe ukazují, že lze nabírat i v maintenance / mírném deficitu (zvlášť pro natural, začátečníky, návrat po pauze).
- **U hubnutí** doplnit varování proti podkročení BMR.
- **TDEE vysvětlit jako průměr**, ne instrukci na den. Vícedenní příjem/výdej se hodnotí, ne jednodenní.
- **Disclaimer** přidat k metabolismu i makrům: "vychází z aktuálních vědeckých poznatků, věda se vyvíjí, doporučení nejsou závazné instrukce, uživatel je nemusí dodržovat".
- **Vysvětlit zdroje** čísel: proč 1.8 g/kg protein (ISSN range 1.6–2.2), proč 25 % tuk (Helms et al. — minimum pro hormonální zdraví), proč zbytek carbs.
- **Protein adjustment per goal**: cut 2.0–2.4 g/kg > maintenance 1.8 > bulk 1.6–1.8. Aktuálně fixně 1.8 g/kg v `src/lib/bmr.ts:95`.

### 16.3 🔜 Dietní preference (lowcarb / keto / highcarb / standard)

**Stav:** vize, neimplementováno.

**Idea:** Uživatel si v onboardingu vybere preferovaný styl stravování. Makra se podle toho upraví:
- **Standard** (aktuální) — 25 % tuk / 1.8 g/kg protein / zbytek carbs
- **Lowcarb** — ~40 % tuk / 20 % carbs / vyšší protein
- **Keto** — ~70 % tuk / <10 % carbs / mírný protein
- **Highcarb** — <20 % tuk / vyšší carbs / 1.8 g/kg protein

**Pozn.:** Hodnoty jsou výchozí — uživatel je může v profilu doupravit. App neprosazuje žádný styl, jen nabízí presets.

### 16.4 🔜 Onboarding — per-type training frequency

**Stav:** vize, neimplementováno.

**Problém:** Aktuální stepper "Kolik dní v týdnu trénuješ?" (max 7) je v pořádku pro lidi s jedním typem tréninku. Hybridní cvičenci (3× silově + 2× kardio) nemají možnost zadat různé frekvence per typ.

**Idea:** Místo jednoho čísla rozdělit na sekce per training type — X dní silově, Y dní kardio, Z dní jiné. TDEE výpočet se zpřesní.

### 16.5 🐛 Bugy nalezené při testování (k opravě v dalším sprintu)

1. **Bílá obrazovka na dashboardu po dokončení onboardingu.** Profile tab funguje, dashboard ne. Pravděpodobně buď JS error v jedné z komponent (`useCycleLogs`, `useNutrition`, `useWeightLogs`), nebo race condition s `useProfile` mezi onboarding completion a dashboard mount.
2. **Profil v záložce Profil není předvyplněn údaji z onboardingu.** `useProfile().updateProfile` v onboardingu by měl perzistovat, ale po navigaci na profile screen nejsou hodnoty načtené. Možná druhý `useProfile` instance neaktualizuje state z DB.

**Priorita:** Vysoká — blokuje další testování. Řešit hned po Sprintu I (před UX redesignem 16.1).

### 16.6 ✅ Cycle privacy redesign — fáze 1 (2026-05-22)

**Stav:** první iterace implementována. Lokální mužský partner-tracking odstraněn, ženský cyklus opt-in.

**Co se změnilo:**
- Žena: nový `profiles.cycle_tracking_enabled` flag. Default OFF pro nové, backfilled TRUE pro stávající ženy s logy. Když OFF, záložka Cyklus se nezobrazí v Progress ani phase chip na dashboardu. Toggle umístěn pod sekcí „Soukromí" v profilu (záměrně dolů, ne front-and-center).
- Muž: kompletně odstraněn lokální „Cyklus partnerky" — žádný toggle v profilu, žádná záložka Partnerka v Progress, žádný cycleMode='partner' na dashboardu. Důvod: bez account linkingu (15.5) bylo neestetické, že muž zadává partnerce menstruaci sám. Existující data v `cycle_logs.is_partner=true` zůstávají v DB pro budoucí migraci (žádné destruktivní mazání).
- Sloupec `profiles.has_partner_cycle` zůstává v DB (nepoužívaný v UI) — destruktivní změna by vyžadovala další migraci.

**Co zbývá k vymýšlení (odloženo, není priorita pro teď):**
- **Edukativní záložka** pro muže i ženy — obecné informace o ženském těle / fázích cyklu, o cvičení, dietách, fastingu, makrech, mikronutrientech. Diskrétně schované pod nějakou obecnější sekcí („o lidském těle" apod.), aby to nebylo front-and-center. Do budoucna affiliate odkazy / monetizace. Existující `PARTNER_PERSPECTIVE` data v `src/types/cycle.ts` jsou připravená k recyklaci.
- **Při příchodu couple linkingu** (15.5): re-aktivovat sdílení fáze partnerky s per-phase consent. Žena vybírá, které fáze chce s mužem sdílet; nesdílené dostávají generickou hlášku ve smyslu „partnerka tuto fázi nesdílí". Žádné konkrétní dny — jen fáze. Muž i žena musí mít odpovídající toggle zapnutý.

### 16.7 ✅ Drobné opravy hotové v této session

- `register.tsx`: opraveno aby po `signUp` nevyskakoval alert "zkontroluj email" když je session už vytvořená (= email confirmation vypnuté v Supabase).
- `onboarding.tsx` + `profile.tsx`: text "Kolikrát týdně trénuješ?" → "Kolik dní v týdnu trénuješ?" (správnější formulace, max 7 dává smysl).

### 16.8 📋 Provozní rozhodnutí 2026-05-21

- **Backupy v Supabase**: free tier nemá auto backupy. Při launchi zůstaneme na free + manuální `pg_dump` cron → R2/S3 jako levná pojistka. Pro tier ($25/mo, 7denní backup retence) až cash flow z platících uživatelů to pokryje.
- **Migrace dat účet A → účet B**: jednorázový poplatek (NE součást subscription).
- **Export dat** (CSV/JSON): jednorázový poplatek; GDPR-friendly, snižuje support load.
- **Reklamy ve free tier**: ano — banner + občasné video interstitial (skip po pár vteřinách). Premium = bez reklam. Architektura: `entitlements.ads_disabled` flag.
- **Liborův účet**: vše odemčené zdarma (admin/owner flag v DB).

### 16.9 🐛✅ Exercise body_part filtr opraven (2026-05-28)

**Problém:** Filtr v exercise pickeru (Vše/Hrudník/Záda/…) vracel u většiny partií 0 cviků — „Hrudník" 0, „Záda" 182 (smetiště). Příčina: seed skript mapoval `body_part` z free-exercise-db pole `category`, jenže to jsou typy tréninku (strength/cardio/stretching/powerlifting/strongman/…), ne svalové partie. Skoro vše skončilo jako `body_part='strength'`.

**Fix (2026-05-28):** `body_part` přepočítán z `muscle_group` (= `primaryMuscles[0]`, uložené správně) přes coarse grouping. Single source of truth: `src/lib/bodyParts.ts` (sdílí filtr UI, seed skript i migrace). Nová taxonomie: Hrudník / Záda / Ramena / Paže / Nohy / Lýtka / Břicho / Krk / Ostatní. Migrace `20260528_fix_exercise_body_part.sql` (UPDATE podle muscle_group). Seed skript opraven pro budoucí re-importy. ZBÝVÁ uživatel: aplikovat migraci.

### 16.10 🔜 Exercise obrázky (Strong-style)

**Stav:** vize, neimplementováno.

**Idea:** U každého cviku zobrazit obrázek/animaci, ne jen název (jako Strong). Zdroj: free-exercise-db má `images[]` pole (relativní cesty k PNG v jejich repu, raw URL `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<path>`). Při importu jsme je zahodili — stačí přidat sloupec `exercises.image_url` (nebo `images text[]`), doplnit do seed skriptu a zobrazit v pickeru + detailu. 2 obrázky per cvik (start/end pozice).

**Pozn.:** Obrázky jsou hostované na GitHubu — pro produkci zvážit mirror do Supabase Storage / R2 (rychlost, nezávislost na third-party). Pro MVP stačí raw GitHub URL.

### 16.11 🔜 Strong-style zadávání sérií (redesign workout flow)

**Stav:** vize, větší redesign. Reference: screenshoty ze Strongu (2026-05-28).

**Co se Liborovi líbí na Strongu a chce přenést:**
- **Per-set řádky** s sloupci: Set # / Previous (minule) / kg / Reps / ✓ (lock/done).
- **Previous sloupec** — ukazuje co uživatel zvládl posledně u stejného cviku (např. „30 kg × 12"), jako reference pro dnešek.
- **Warmup sety** — označené `W` (oranžově), nepočítají se do objemu jako pracovní série.
- **Inline zadávání** — po každé sérii uživatel zapíše kg + reps přímo do předpřipravených řádků v běžícím tréninku. Přesně odpovídá reálnému postupu (série → zápis → rest → další série).
- **Rest timer mezi sériemi** — odpočet zobrazený pod každou sérií (Sprint I rest timer už máme, jen jinak vizualizovaný — per-set místo globální).
- **+ Add Set** tlačítko per cvik.

**Pozn.:** Tohle je přepracování workout-detail obrazovky (`workouts/[id].tsx`) z aktuálního „přidej jednu sérii" modelu na Strong-style tabulku. Velký kus — vlastní sprint. Datově: `workout_sets` už má reps/weight/set pořadí; přidat `is_warmup` flag a „previous" lookup (poslední workout_set pro daný exercise_id daného usera). Provázat s rest timerem per-set.
