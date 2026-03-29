# Flashcards v0.1

## Cél
Egyszerű, UX‑barát tanulókártya modul:
- Kártya létrehozás (front/back)
- Kártyák listázása
- Gyakorlás mód (front/back flip)

## MVP döntések
- Helye: diák dashboardon, külön fül
- Funkciók: létrehozás + listázás + gyakorlás
- Gyakorlás: egyszerű flip + navigáció

## Backend
### Új tábla
`flashcards`
- id (uuid)
- owner_id (uuid)
- front (text)
- back (text)
- created_at (timestamp)

### API
- `GET /api/flashcards` – saját kártyák
- `POST /api/flashcards` – új kártya
- `DELETE /api/flashcards/:id` – törlés

## Frontend
### Új tab
Dashboard → “Tanulókártyák”

### UI komponens
- `Flashcards`:
  - új kártya form
  - gyakorlás mód (flip)
  - lista mód + törlés

## Stílus
Egységes kártya‑design, a többi UI blokkhoz illesztve:
- `flashcard` kártya
- `flashcard-list` listanézet
- `flashcard-practice` gyakorlás

## Következő lépések
- Kártyák csoportosítása (témák)
- Import kvízből
- Progress/SM2 ütemezés
