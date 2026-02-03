# Gamification v0.1 (XP + Szint + Rang + Napi Küldetések)

## Cél
Játékos élmény bevezetése a Mentora platformon:
- XP gyűjtés és szintlépés
- Rang megjelenítése
- Napi küldetések (véletlen + nehézség alapján)
- Statisztika + badge blokkok a dashboard tetején

## Döntések (MVP)
- Megjelenés: Dashboard teteje
- Napi küldetés: véletlen, nehézséghez igazítva
- Rang/szint: XP alapú

## Backend lépések
1. **Új táblák**
   - `daily_missions`: naponta generált küldetések
2. **Gamification service**
   - `computeLevel(xp)` → szint
   - `computeRank(level)` → rang
   - `ensureDailyMissions(userId)` → napi küldetések létrehozása
   - `updateDailyMissionsOnAttempt(userId, scorePercent)` → progress + XP jutalom
3. **Quiz kitöltés hook**
   - `POST /api/quizzes/:id/attempt` → XP + küldetés frissítés
   - `POST /api/share/:token/submit` → ha bejelentkezett, frissítés
4. **Dashboard data endpoint**
   - `GET /api/users/me/overview` → XP, szint, rang, napi küldetések

## Frontend lépések
1. **Dashboard blokk**
   - `XP panel`: szint, rang, progress bar
   - `Napi küldetések`: 2 kártya progresszel
   - `Statisztika + badge` ugyanitt
2. **API hook**
   - `getUserOverview()` meghívása dashboardon
3. **Stílus**
   - `xp-panel`, `mission-card`, `mission-grid` osztályok

## Adatmodell
### `daily_missions`
- `id` (uuid)
- `user_id` (uuid)
- `date` (date)
- `mission_id` (text)
- `title` (text)
- `description` (text)
- `type` (text)
- `target` (int)
- `threshold` (int, nullable)
- `difficulty` (text)
- `xp_reward` (int)
- `progress` (int)
- `completed_at` (timestamp)

## Napi küldetések (MVP pool)
### Easy
- Tölts ki 1 kvízt ma
- Érj el 70%+ eredményt egy kvízben
### Medium
- Tölts ki 2 kvízt ma
- Érj el 85%+ eredményt egy kvízben
### Hard
- Tölts ki 3 kvízt ma
- Érj el 100% eredményt egy kvízben

## Szint és rang
- **Szint**: `level = floor(xp / 100) + 1`
- **Rang**:
  - 1–2: Újonc
  - 3–4: Tanuló
  - 5–6: Felfedező
  - 7–8: Haladó
  - 9–10: Mester
  - 11+: Legenda

## Következő lépések
- Küldetés rotáció (heti vagy tematikus pool)
- Napi reset időzítés (időzóna kezelés)
- Streak küldetések
- Ranghoz vizuális keret / badge

## v0.2 kiegészítések (implementálva)
### Új funkciók
- **Streak küldetések** (3 vagy 5 napos sorozat)
- **Napi reset időzóna**: kliens `X-Timezone-Offset` header alapján
- **Küldetések külön oldala**: `/missions` route

### Új táblák
- `user_streaks`: current_streak, last_active_date

### API
- `GET /api/users/me/missions?limit=28` → múltbéli küldetések

### Megjelenés
- Navbar diákoknak: “Küldetések” gomb
- Dashboard tetején: streak megjelenítése
