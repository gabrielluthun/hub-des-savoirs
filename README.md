# Hub du Savoir

SPA locale de révision / culture générale : notes Google Docs, cartes Anki, listes JetPunk, module Quizypedia, et **Plateau** (quiz IA à partir de vos ressources).

## Stack

- React 19 + Vite + TypeScript 7
- Tailwind CSS 3 (dark via classe `.dark`, variables HSL)
- Fonts : Outfit, IBM Plex Sans, JetBrains Mono
- Lucide React + Sonner
- État : Context + `useReducer` (`StoreProvider`)
- Persistance : `localStorage` clé `gk-hub-state-v1`
- Gemini REST (`generativelanguage.googleapis.com/v1beta`) via `fetch` (pas d’Axios)
- Modèle par défaut : `gemini-3.5-flash-lite`

## Prérequis

- Node.js 18+
- Une clé API [Google AI Studio](https://aistudio.google.com/apikey) pour Plateau

## Installation

```bash
npm install
npm run dev
```

Build production :

```bash
npm run build
npm run preview
```

## Modules

| Onglet | Rôle |
|--------|------|
| Google Docs | Notes markdown, import Docs (`/export?format=txt`), aperçu, iframe |
| Anki | Cartes, import masse, export `.txt` TSV |
| JetPunk | Listes catégorisées + quiz chronométré |
| Quizypedia | Placeholder ; activation dans Paramètres → Modules |
| Plateau | Quiz IA à partir de vos ressources |
| Paramètres | Clé API, modèle, thème, modules, sons |

## Données

- **Stockage :** les données restent sur **ce navigateur / cet appareil**. 
Un autre appareil, un autre profil, ou le mode privé = état vide (ou distinct).
- **GitHub Pages :** même modèle : chaque visiteur gère ses propres données locales ; le site hébergé ne lit ni n’enregistre rien côté serveur.

## Licence

Usage personnel / projet pédagogique.
