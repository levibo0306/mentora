# Mentora Prototype (v0.3) Dokumentáció

Ez a mappa tartalmazza a Mentora projekt működő prototípusának teljes műszaki és funkcionális dokumentációját. A prototípus célja a "Core Loop" (Tanár létrehoz -> Diák kitölt -> Eredmény születik) demonstrálása.

## 🌟 Legfontosabb Funkciók
* **Autentikáció:** Teljeskörű regisztráció és bejelentkezés (Tanár/Diák szerepkörökkel).
* **Kvíz Szerkesztő:** Dinamikus űrlap kérdések és válaszok felvételére validációval.
* **Kvíz Lejátszó:** Interaktív felület a diákok számára a tesztek kitöltéséhez.
* **Adatbázis:** Perzisztens adattárolás PostgreSQL-ben (Supabase).

## 📂 Dokumentáció Tartalma
* [Termék Specifikáció (Spec)](./docs/specs/product_spec_v0.3.md): Részletes funkciólista.
* [User Stories](./docs/stories/implemented_stories.md): Felhasználói történetek és státuszuk.
* [Adatbázis Architektúra](./docs/architecture/database_schema.md): Táblák, típusok és kapcsolatok.
* [API Referencia](./docs/architecture/api_reference.md): Backend végpontok leírása.
* [Használati Útmutató](./docs/manuals/user_guide.md): Hogyan használd a rendszert.

## 🚀 Telepítés és Futtatás

### Backend
```bash
cd apps/backend
npm install
npm run dev
```

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

### 2. `docs/prototype/docs/specs/product_spec_v0.3.md`
Ez a részletes leírás arról, mit tud a szoftver.

```markdown
# Termék Specifikáció v0.3 (Prototype)

## 1. Bevezetés
A v0.3 verzió a "Proof of Concept" fázis lezárása. A rendszer képes kiszolgálni a tanárok tartalomgyártási igényeit és a diákok tanulási folyamatát egy alapvető kvíz-motoron keresztül.

## 2. Felhasználói Szerepkörök

### 2.1 Tanár (Teacher)
* **Jogosultságok:**
  * Kvízek létrehozása, szerkesztése, törlése.
  * Kérdések hozzáadása a kvízekhez.
  * Saját kvízek listázása a Dashboardon.
* **Cél:** Gyors és egyszerű számonkérő eszközök készítése.

### 2.2 Diák (Student)
* **Jogosultságok:**
  * Kvízek megtekintése és indítása.
  * Kérdések megválaszolása interaktív felületen.
  * Azonnali visszajelzés (eredmény százalékban).
* **Cél:** Tudásfelmérés és gyakorlás.

## 3. Funkcionális Követelmények

### 3.1 Hitelesítés (Auth)
* **Regisztráció:** Email, jelszó és szerepkör (Teacher/Student) megadása kötelező.
* **Login:** JWT alapú munkamenet kezelés.
* **Biztonság:** Lejárt token esetén automatikus kijelentkeztetés és átirányítás.

### 3.2 Kvíz Kezelés (CRUD)
* **Létrehozás:** "One-page" élmény. A kvíz címe és a kérdések egy ablakban (Modal) adhatók meg.
* **Validáció:**
  * Kvíz cím kötelező.
  * Minimum 1 kérdés kötelező.
  * Kérdésenként minimum 2 válasz kötelező.
  * Helyes válasz megjelölése kötelező.
* **Megjelenítés:** Kártya nézet a Dashboardon, amely tartalmazza a címet, leírást és akciógombokat.

### 3.3 Kvíz Kitöltés (Player Engine)
* **Felület:** Egyszerre egy kérdés jelenik meg.
* **Navigáció:** "Következő" gomb, amely csak válaszadás után aktív.
* **Kiértékelés:** A szerver végzi a pontszámítást a biztonság érdekében (Server-Side Validation).
* **Eredmény:** A kitöltés végén százalékos értékelés és helyes válaszok száma.

## 4. Technológiai Stack
* **Frontend:** React (Vite), TypeScript, CSS Modules.
* **Backend:** Node.js (Express), TypeScript, Zod.
* **Adatbázis:** PostgreSQL (Supabase).