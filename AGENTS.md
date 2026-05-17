# AGENTS.md — Detailní execution pravidla pro GymTracker

Toto je rozšíření `CLAUDE.md`. Platí pro všechny AI agenty pracující na projektu.

---

## 1) Source of truth

- `PROJECT_PLAN.md` — priority a pořadí implementace
- `DEV_DIARY.md` — průběžný implementační log (povinný)
- `SECURITY.md` — závazná bezpečnostní pravidla

---

## 2) Default workflow

1. Přečti `PROJECT_PLAN.md` — vyber první nezaškrtnutý bod
2. Dokonči malý až střední nízkorizikový batch (1 obrazovka nebo 1 API feature)
3. Ověř funkčnost (`tsc --noEmit`, `npx expo export --platform web`, relevantní testy)
4. Aktualizuj `DEV_DIARY.md` (timestamp + výsledek OK/FAIL)
5. Commit (Conventional Commits styl)
6. Pokračuj na další nezaškrtnutý bod

---

## 3) Execution pravidla

**Autonomie:**
- Pokračuj bez ptaní, dokud jsou kroky safe a logicky spolu souvisí
- Zastav pouze když: (a) milestone hotov, (b) potřeba schválení uživatele, (c) skutečná nejasnost, (d) rozpor mezi kódem a dokumentací

**Milestone sizing:**
- 1 obrazovka nebo 1 API feature = 1 sub-milestone
- Ne ultra-mikro kroky (jedna proměnná), ne mega-kroky (celý sprint najednou)
- Preferuj logicky uzavřené celky, které se dají demo-ovat

**Před změnou směru:**
- Ověř aktuální implementaci v repozitáři (co existuje, co funguje)
- Nespouštěj refactor bez porozumění existujícímu kódu

**DEV_DIARY je povinný:**
- Každý implementační krok: `YYYY-MM-DD HH:MM — [krok] — OK/FAIL`
- Při FAIL: zapsat co selhalo a jak bylo opraveno

---

## 4) Expo / React Native specifika

- **Expo Go first**: vždy ověřit na fyzickém zařízení přes Expo Go, ne jen simulator
- **Expo Router**: používat file-based routing (`app/` složka), ne React Navigation
- **TypeScript strict**: `strict: true` v `tsconfig.json` od začátku
- **Offline-first mindset**: UI musí fungovat bez internetu; pro local cache použít `expo-sqlite` nebo `@react-native-async-storage/async-storage`
- **Styles**: StyleSheet.create() nebo NativeWind (Tailwind pro RN) — dohodnout před Sprint A

---

## 5) Supabase specifika

- **RLS povinně**: každá nová tabulka dostane Row Level Security policies před prvním použitím
- **Migrace přes Supabase Dashboard nebo CLI** — nikdy přímé ALTER TABLE v produkci
- **anon key** jde do `.env` jako `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Expo ho zahrne do bundlu — je to OK pro anon key)
- **service_role key** se nikdy nedostane do app kódu ani `.env` — patří jen na serverové Edge Functions
- **Auth**: Supabase Auth (email/heslo + Magic Link) — neimplementovat vlastní JWT

---

## 6) Ochrana citlivých dat — závazná pravidla

Viz `SECURITY.md` pro kompletní checklist.
Zkrácená verze:
- Nikdy: API klíče, hesla, JWT secrets v kódu nebo dokumentaci
- Vždy: citlivé hodnoty jen v `.env` (gitignorován)
- Při přidání nového env klíče: aktualizuj `.env.example` s placeholder

---

## 7) Kvalita kódu

- Žádné `any` v TypeScript bez komentáře proč
- Žádné `console.log` v produkčním kódu
- Komponenty maximálně ~150 řádků — větší rozdělit
- Hooks extrahovat do `src/hooks/`, API calls do `src/lib/` nebo `src/services/`
- Žádné hardcoded strings v UI — konstanty nebo i18n od začátku

---

## 8) Git pravidla

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Commit po každém sub-milestone (ne po každém řádku, ne jednou za sprint)
- Nikdy `git commit -m "wip"` nebo `git commit -m "fix"` bez kontextu
- Nikdy commitat `.env`, `node_modules/`, `.expo/`
