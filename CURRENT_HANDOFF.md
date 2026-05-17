# CURRENT_HANDOFF.md — GymTracker

Aktuální stav projektu pro předání kontextu v nové konverzaci.

---

## Přehled projektu

**GymTracker** — mobilní aplikace pro iOS + Android.
Funkce: záznamy tréninků, jídelníček, progress tracker (váha, míry, fotky), dashboardy.

**Cílový uživatel**: jednotlivec sledující svůj fitness progress.

---

## Tech stack

| Vrstva | Technologie |
|---|---|
| Mobile | Expo (React Native) + TypeScript |
| Routing | Expo Router (file-based, `app/` složka) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Styling | TBD — NativeWind nebo StyleSheet.create (rozhodnout v Sprint A) |
| Testy | Jest + React Native Testing Library |
| CI/CD | GitHub Actions + EAS Build |

---

## Aktuální stav

**Stav**: Projekt inicializován — meta-soubory vytvořeny, žádný app kód zatím.

**Git**: repozitář inicializován, GitHub: `https://github.com/Libords/gym-tracker`

---

## Spuštění (po dokončení Sprint A)

```bash
# Dev server
cd ~/Documents/gym
npx expo start

# Type check
npx tsc --noEmit

# Testy
npx jest
```

---

## Supabase

- Projekt: vytvořit na https://supabase.com
- URL a anon key uložit do `.env` (viz `.env.example`)
- Dashboard: https://app.supabase.com

---

## Co dál (Sprint A)

1. `npx create-expo-app gymtracker --template expo-template-blank-typescript`
2. Vytvořit Supabase projekt + přidat URL a anon key do `.env`
3. Nainstalovat `@supabase/supabase-js` + `@react-native-async-storage/async-storage`
4. Nastavit Expo Router
5. Login + Register obrazovky

---

## Jak pokračovat v nové konverzaci

1. Přečti `AGENTS.md` (execution pravidla)
2. Přečti `PROJECT_PLAN.md` (priority)
3. Přečti `SECURITY.md` (bezpečnostní pravidla)
4. Pokračuj od prvního nezaškrtnutého bodu v PROJECT_PLAN.md
