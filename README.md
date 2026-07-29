# Hub du Savoir

SPA locale de révision / culture générale : notes Google Docs, cartes Anki, listes JetPunk, module Quizypedia (feature flag), et **Plateau** (quiz télé généré par Gemini).

## Stack

- React 19 + Create React App 5 + CRACO (alias `@/`)
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
npm start
```

Build production :

```bash
npm run build
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

Tout est offline-first dans le navigateur. Aucun backend. La clé Gemini ne quitte pas `localStorage`.

## Licence

Usage personnel / projet pédagogique.
