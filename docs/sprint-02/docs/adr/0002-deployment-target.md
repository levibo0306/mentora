# ADR 0002 – Deployment cél

## Dátum
2025-10-28

## Kontextus
A projekt Vite alapú, kevés háttérlogikával, preview környezetre van szükség.
Gyors build, automatikus preview URL-ek kellenek.

## Döntés
A Vercel lesz a deploy platform.

## Alternatívák
- Firebase Hosting – lassabb preview, több setup
- VM alapú saját hosting – feleslegesen bonyolult

## Következmények
+ Gyors preview
+ Minimális setup
+ CI könnyű integráció  
- Vercel free tier limitációk
