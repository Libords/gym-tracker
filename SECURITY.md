# SECURITY.md — Bezpečnostní pravidla GymTracker

Tento soubor je závazný pro všechny AI agenty i vývojáře pracující na projektu.

---

## 1) Co NIKDY nesmí být v kódu ani v commitovaných souborech

| Typ dat | Příklad |
|---|---|
| Supabase URL | `https://xyz.supabase.co` |
| Supabase anon key | `eyJhbGci...` |
| Supabase service_role key | `eyJhbGci...` (nebezpečnější než anon!) |
| JWT secret | jakýkoliv secret string |
| Hesla uživatelů | nikdy v kódu ani testech |
| Osobní data uživatelů | jména, emaily, váha — jen v DB |
| Lokální cesty OS | `/Users/liborslefr/...` — nepřidávat do docs pro GitHub |

---

## 2) Správný vzor — citlivé hodnoty patří jen do `.env`

```bash
# .env  ← gitignorován, NESMÍ jít do gitu
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
# service_role key NIKDY sem — patří jen na server (Edge Functions)
```

Kód pak čte hodnotu výhradně přes env:
```typescript
import Constants from 'expo-constants';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

---

## 3) Expo / mobilní app specifika

- **`EXPO_PUBLIC_` prefix**: Expo zahrne do JS bundlu jen proměnné s prefixem `EXPO_PUBLIC_`
- **anon key v bundlu je OK** — Supabase anon key je navržen jako veřejný, chrání ho RLS
- **service_role key NIKDY v app kódu** — obchází RLS, dává plný přístup k DB
- **Secrets pro server logic**: použít Supabase Edge Functions s env proměnnými (nastavit v Supabase Dashboard, ne v kódu)
- **`expo-constants`**: nepoužívat pro secrets — `app.config.js` je viditelný v bundlu

---

## 4) Supabase Row Level Security (RLS)

- **Každá tabulka musí mít RLS** zapnuté před prvním použitím
- **Bez RLS policy = žádný přístup** (po zapnutí RLS)
- Základní vzor pro user-owned data:
  ```sql
  -- Uživatel vidí jen svá data
  CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);
  ```
- Před deploym zkontrolovat: všechny tabulky mají RLS + smysluplné policies

---

## 5) Co je gitignorováno

```
.env
.env.local
.env.*.local
node_modules/
.expo/
dist/
*.log
```

**Tyto soubory nesmí být nikdy force-committovány.**

---

## 6) Checklist před produkcí / veřejným releasem

- [ ] RLS zapnuto na všech tabulkách
- [ ] Žádný `service_role key` v app kódu
- [ ] `.env` není v git historii (`git log --all -- .env` musí být prázdné)
- [ ] Žádné `console.log` s citlivými daty
- [ ] Expo EAS secrets nastaveny přes `eas secret:create`, ne v kódu
- [ ] Žádné hardcoded demo hesla v produkčním kódu

---

## 7) Pravidla pro AI agenty

- Nikdy nezapisovat reálná hesla ani API klíče do kódu, testů ani dokumentace
- Nikdy necommitovat `.env` soubory
- Při přidání nového env klíče: vždy aktualizovat `.env.example` s placeholder hodnotou
- Při detekci citlivých dat v existujícím kódu: ihned upozornit uživatele
- Testovací/demo data jsou akceptovatelná v dev prostředí, ale musí být odstraněna před produkcí
