# Project Plan – Mentora

## Egy mondatos értékajánlat

A Mentora egy hallgatóknak és oktatóknak szóló tanulástámogató platform, amely kvízeket, tanulókártyákat, témákba szervezett tananyagokat és motivációs mechanikákat egyesít, miközben a több szerepkör, a személyre szabott tanulási folyamat és az AI-alapú tartalomgenerálás miatt nem triviális rendszer.

## Képességek

| Képesség | Kategória | Komplexitás | Miért nem triviális? |
|---|---|---|---|
| Bejelentkezés és szerepkör-alapú hozzáférés | Productization | M | Hallgató és oktató eltérő jogosultságai, route-védelem, token-kezelés, biztonságos jelszóhash-elés |
| Kvízek létrehozása, szerkesztése és kitöltése | Value | L | Több entitás kapcsolatban van egymással, kérdéskezelés, pontszámítás, külön tanári és hallgatói nézet |
| Tanulókártya modul gyakorló móddal | Value | M | CRUD mellett használható gyakorló UX kell, állapotkezeléssel és jövőbeli bővíthetőséggel |
| Témák/projektek kezelése és megosztása kóddal/linkkel | Value | L | Kvízek és kártyák témához kötése, megosztási folyamat, jogosultság-ellenőrzés, diák oldali claim folyamat |
| Gamification: XP, szintek, napi küldetések | Value | L | Több eseményből számolt előrehaladás, napi reset, időzóna-kezelés, motivációs logika és dashboard megjelenítés |
| AI-alapú kérdésgenerálás feltöltött szövegből | Value | L | Promptolás, strukturált kimenet validálása, hibás LLM-válaszok kezelése, felhasználói kontroll biztosítása |
| Hibaállapotok, retry és felhasználóbarát visszajelzések | Productization | M | API- és UI-hibák egységes kezelése, nem csak technikai hanem érthető felhasználói kommunikációval |
| Tesztek, mérhetőség és stabil release-folyamat | Productization | M | Unit és acceptance tesztek, coverage, health/metrics végpontok, reprodukálható fejlesztői és beadási környezet |

**Kategória:** `Value` (felhasználó érzékeli) vagy `Productization` (minőséget garantál: auth, hibakezelés, tesztek, deploy)

**Komplexitás:** `S` < 1 nap · `M` 2–5 nap · `L` 1+ hét

## A legnehezebb rész

A legnehezebb rész várhatóan az AI-alapú kérdésgenerálás megbízható beillesztése lesz, mert az LLM kimenete nem determinisztikus: a generált kérdések minőségét, szerkezetét és pedagógiai használhatóságát is kontrollálni kell, miközben a rendszernek hibás vagy gyenge válasz esetén is stabilan kell működnie.

## Tech stack – indoklással

| Réteg | Technológia | Miért ezt és nem mást? |
|---|---|---|
| UI | React + TypeScript + Vite | Gyors iterációt ad interaktív dashboardokhoz és szerepkörfüggő felületekhez; egyszerűbb prototípus-fejlesztést ad, mint egy nehezebb full-stack framework |
| Backend / logika | Node.js + Express + TypeScript + Zod | Az API, auth, AI-integráció és üzleti logika egy könnyen bővíthető szolgáltatásban tartható; kisebb overhead, mint egy nagyobb enterprise keretrendszernél |
| Adattárolás | PostgreSQL | A felhasználók, kvízek, kérdések, témák, megosztások és statisztikák relációs modellje jól kezelhető benne, erősebb konzisztenciával, mint egy dokumentum-orientált adatbázisban |
| Auth | JWT-alapú authentikáció + bcrypt + szerepkörök | A prototípusban egyszerűen integrálható SPA + REST architektúrához, miközben a jogosultsági modell explicit módon kezelhető |

## Ami kimarad (non-goals)

- Teljes értékű valós idejű multiplayer kvízjáték websocket alapokon
- Offline-first működés és lokális szinkron
- Többnyelvű felület az első beadási verzióban
- Komplex automatikus esszéjavítás vagy hosszú szöveges beadandók értékelése

## Ami még nem tiszta

- Az AI-kérdésgenerálásnál milyen minőségi metrikával lehet objektíven értékelni a generált kérdéseket
- A gamification mennyire marad motiváló hosszabb távon, és nem tolja-e el túlzottan a használatot pontgyűjtés irányába
- Kell-e a prototípus után refresh tokenes auth-flow vagy elég a rövidebb életű access token
- A témák megosztásánál a kódos beléptetés és a publikus link milyen biztonsági korlátokkal működjön
