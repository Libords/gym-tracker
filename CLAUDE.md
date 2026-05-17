# GymTracker — Claude Code instrukce

## Source of truth
- `PROJECT_PLAN.md` — priority (vždy číst první)
- `DEV_DIARY.md` — log kroků (vždy aktualizovat po každém kroku)
- `AGENTS.md` — detailní execution pravidla
- `SECURITY.md` — bezpečnostní pravidla (závazná)

## Styl odpovědí
- Stručně bodově, bez závěrečných shrnutí
- Šetři tokeny — nezopakuj to, co je vidět z diff

## Pravidla práce
- Čti soubor před editací — nikdy neupravuj naslepo
- Po každém sub-milestone: ověř (`tsc --noEmit` / `npx expo export` / testy), pak commit
- Commit message: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Čeština UI, angličtina kód + commity + komentáře v kódu
- TypeScript vždy — žádný `.js` soubor v `src/`
- Preferuj malé kroky (1–3 soubory najednou), logicky uzavřené milestony

## Co vyžaduje schválení uživatele
- `npm install` (nové závislosti)
- Supabase migrace (změny DB schématu)
- `git reset --hard`, force push
- Napojení nové externí služby
- Mazání dat nebo sloupců v DB

## Nikdy
- API klíče / hesla / secrets v kódu → jen `.env`
- Commitovat `.env` soubory
- Zanechat broken build v gitu
