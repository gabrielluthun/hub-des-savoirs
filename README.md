# Hub des Savoirs

App de révision et de culture générale. Elle regroupe vos notes (markdown ou Google Docs), des cartes Anki avec répétition espacée, des listes JetPunk chronométrées, et **Plateau** : des quiz générés par Gemini à partir de ces ressources.

Disponible en **navigateur** et téléchargeable en **app desktop**. Pas de version iOS / Android.

## Démarrage

**Prérequis :** Node.js 20.19+ (ou 22.12+), et une clé [Google AI Studio](https://aistudio.google.com/apikey) pour Plateau et la génération Anki.

```bash
npm install
npm run dev
```

```bash
npm run build      # build production
npm run preview    # aperçu du build
```

### Desktop

Rust est requis. 
Sur macOS : Xcode CLT.

```bash
npm run tauri:dev     # app native + hot reload
npm run tauri:build   # installateur (.dmg / .msi / …)
```

## Modules

| Module | Contenu |
|--------|---------|
| **Google Docs** | Notes markdown, import / sync Google Docs, aperçu, plan |
| **Anki** | Decks, tags, SRS, import/export TSV, génération IA, envoi vers JetPunk |
| **JetPunk** | Listes chronométrées, alias, stats, historique, envoi vers Anki |
| **Plateau** | Quiz IA (QCM, libre, vrai/faux, liste) depuis docs / Anki / JetPunk — difficulté, minuteur, anti-répétition, historique, sons |
| **Quizypedia** | Placeholder (Paramètres → Modules) |
| **Paramètres** | Clé Gemini, thème, modules, sons, sauvegarde JSON, mises à jour desktop |

## Données

Docs, cartes, listes, historiques, et réglages restent sur **cet appareil / ce navigateur**. 
Un autre profil, une autre machine ou le mode privé d'un navigateur = état vide.

**Sauvegarde** (Paramètres) : export et restauration d’un JSON complet du Hub des Savoirs.  

## Stack

| Couche | Choix |
|--------|--------|
| UI | React 19, Vite 7, TypeScript 7 |
| Desktop | Tauri 2 (`src-tauri/`) |
| Styles | Tailwind CSS 3 (clair / sombre) |
| Icônes / toasts | Lucide React, Sonner |
| État | Context + `useReducer` |
| Persistance | `localStorage` |
| IA | Gemini REST (`gemini-3.5-flash-lite` par défaut) |

## Structure

```
src/
  app/           # shell, sidebar, navigation
  components/ui/ # primitives UI
  features/      # docs, anki, jetpunk, plateau, quizypedia, settings
  lib/           # stockage, gemini, backup…
  store/         # état global
  types/
src-tauri/       # app desktop
.github/workflows/
  deploy.yml           # GitHub Pages
  publish-tauri.yml    # releases desktop
```

## Licence

Usage personnel / projet pédagogique.
