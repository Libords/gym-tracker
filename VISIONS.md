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
