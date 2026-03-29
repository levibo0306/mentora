# Témák/Projektek v0.1

## Cél
Kvízek és tanulókártyák témákhoz (projektekhez) kötése.
Tanár több kvízt és sok kártyát tud egy témán belül kezelni.

## MVP funkciók
- Tanár témát hoz létre (név + leírás + tantárgy + évfolyam + szín)
- Kvíz létrehozásnál téma kiválasztható
- Tanulókártyák témához köthetők
- Téma megosztása kóddal/linkkel
- Diák “Témák” fülön látja és hozzáadja kóddal

## Backend
### Új táblák
- `topics`
- `topic_shares`

### Új mezők
- `quizzes.topic_id`
- `flashcards.topic_id`

### API
- `GET /api/topics`
- `POST /api/topics`
- `PUT /api/topics/:id`
- `DELETE /api/topics/:id`
- `POST /api/topics/:id/share`
- `POST /api/topics/share/claim`
- `GET /api/quizzes?topic_id=...`
- `GET /api/flashcards?topic_id=...`

## Frontend
- Teacher: Témák panel (létrehozás + megosztás)
- Student: Témák fül + kódos hozzáadás
- Kvíz lista: témaszűrő
- Tanulókártyák: témaszűrő + témához kötés

## Következő lépések
- Téma részletes oldal
- Témák archiválása
- Téma szintű statisztikák
