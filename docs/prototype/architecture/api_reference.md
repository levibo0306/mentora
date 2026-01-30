# API Referencia

A backend REST API-t biztosít a frontend számára. Minden védett végpont `Authorization: Bearer <token>` fejlécet vár.

## Auth
* `POST /api/auth/register` - Regisztráció `{email, password, role}`
* `POST /api/auth/login` - Bejelentkezés `{email, password}` -> Token

## Quizzes
* `GET /api/quizzes` - Bejelentkezett felhasználó saját kvízeinek listázása.
* `GET /api/quizzes/:id` - Egy adott kvíz adatainak lekérése.
* `POST /api/quizzes` - Új kvíz létrehozása `{title, description}`.
* `PUT /api/quizzes/:id` - Kvíz adatainak frissítése.
* `DELETE /api/quizzes/:id` - Kvíz törlése.

## Questions
* `GET /api/quizzes/:id/questions` - Kvíz kérdéseinek lekérése (Diák/Tanár).
* `POST /api/quizzes/:id/questions` - Új kérdés hozzáadása `{prompt, options[], correct_index}`.
* `DELETE /api/quizzes/questions/:id` - Kérdés törlése.

## Attempts (Kitöltés)
* `POST /api/quizzes/:id/attempt`
  * **Body:** `{ answers: { "question_id": selected_index, ... } }`
  * **Response:** `{ score: 85, total: 10, correct: 8 }`