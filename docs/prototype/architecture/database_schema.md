# Adatbázis Séma Dokumentáció

A rendszer PostgreSQL adatbázist használ. Az alábbiakban a v0.3-as verzióhoz tartozó végleges táblaszerkezet látható.

## 1. Táblák (Tables)

### `users`
Felhasználók tárolása.
| Mező | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Egyedi azonosító |
| `email` | TEXT | Egyedi email cím |
| `password_hash` | TEXT | Titkosított jelszó |
| `role` | TEXT | 'teacher' vagy 'student' |
| `created_at` | TIMESTAMPTZ | Regisztráció ideje |

### `quizzes`
A tesztek fejléce (cím, leírás).
| Mező | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Egyedi azonosító |
| `owner_id` | UUID (FK) | Kapcsolat a `users` táblához |
| `title` | TEXT | A kvíz címe |
| `description` | TEXT | Opcionális leírás |
| `created_at` | TIMESTAMPTZ | Létrehozás ideje |

### `questions`
A kvízekhez tartozó kérdések.
| Mező | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Egyedi azonosító |
| `quiz_id` | UUID (FK) | Melyik kvízhez tartozik (`ON DELETE CASCADE`) |
| `prompt` | TEXT | A kérdés szövege |
| `options` | JSONB | Válaszlehetőségek tömbje `["A", "B", ...]` |
| `correct_index` | INTEGER | A helyes válasz indexe a tömbben (0-tól) |
| `explanation` | TEXT | Magyarázat a helyes válaszhoz |

### `attempts`
Kitöltések és eredmények naplózása.
| Mező | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Egyedi azonosító |
| `quiz_id` | UUID (FK) | Melyik kvízt töltötték ki |
| `user_id` | UUID (FK) | Ki töltötte ki |
| `answers` | JSONB | A leadott válaszok `{ "question_id": index }` |
| `score` | INTEGER | Elért eredmény százalékban (0-100) |
| `created_at` | TIMESTAMPTZ | Kitöltés ideje |

## 2. Kapcsolatok (ERD Leírás)
* **Users - Quizzes:** 1:N (Egy tanárnak sok kvíze lehet).
* **Quizzes - Questions:** 1:N (Egy kvízhez sok kérdés tartozik).
* **Users - Attempts:** 1:N (Egy diák sokszor kitöltheti).

(ami még nem szerepel a projektben csak létre van hozva az nincs itt feltünteve)