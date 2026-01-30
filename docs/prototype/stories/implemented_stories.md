# Implementált User Story-k (Status Report)

## Sprint 2 - Prototype (KÉSZ)

### ✅ US-001: Tanári Regisztráció
> Mint tanár, szeretnék regisztrálni, hogy elkezdhessem a munkát.
* **Status:** KÉSZ
* **Megvalósítás:** `/register` oldal, `role` választóval.

### ✅ US-002: Kvíz Létrehozása
> Mint tanár, szeretnék új kvízt létrehozni címmel és kérdésekkel.
* **Status:** KÉSZ
* **Megvalósítás:** Modal ablak, dinamikus kérdésfelvétel, azonnali mentés.

### ✅ US-003: Kérdések Validációja
> Mint rendszer, nem engedhetek létrehozni üres vagy hibás kvízeket.
* **Status:** KÉSZ
* **Megvalósítás:** Frontend validáció (min. 2 válasz, cím kötelező).

### ✅ US-004: Diák Kitöltés
> Mint diák, szeretném kitölteni a tanár által megosztott kvízt.
* **Status:** KÉSZ
* **Megvalósítás:** `/play/:id` útvonal, interaktív léptető felület.

### ✅ US-005: Azonnali Eredmény
> Mint diák, látni szeretném az eredményemet a teszt végén.
* **Status:** KÉSZ
* **Megvalósítás:** Százalékos kijelzés a szerver válasza alapján.

## Tervezett (Backlog / Sprint 3)
* ⏳ **US-006:** Részletes statisztika a tanári dashboardon.
* ⏳ **US-007:** Publikus megosztási linkek generálása.
* ⏳ **US-008:** Kérdések utólagos módosítása (Edit Question).