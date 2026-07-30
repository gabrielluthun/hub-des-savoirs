# Hub des Savoirs

SPA locale et application Desktop de révision et de culture générale. Notes (Google Docs / markdown), cartes Anki avec répétition espacée, listes JetPunk chronométrées, et **Plateau** (quiz généré par Gemini à partir de vos ressources). 

Disponible en **navigateur** (Vite) et en **app desktop** (Tauri 2).
Pas disponible sur iOS / Android.

## Stack

| Couche | Choix |
|--------|--------|
| UI | React 19, Vite 7, TypeScript 7 |
| Desktop | Tauri 2 (`src-tauri/`) |
| Styles | Tailwind CSS 3 (thème clair/sombre via `.dark`, variables HSL) |
| Fonts | Outfit, IBM Plex Sans, JetBrains Mono |
| Icônes / toasts | Lucide React, Sonner |
| État | Context + `useReducer` (`StoreProvider`) |
| Persistance | `localStorage`|
| IA | Gemini REST (`generativelanguage.googleapis.com/v1beta`) via `fetch` |
| Modèle par défaut | `gemini-3.5-flash-lite` |

## Prérequis

- Node.js 18+
- Une clé API [Google AI Studio](https://aistudio.google.com/apikey) pour Plateau et la génération de cartes Anki depuis les docs
- Pour le desktop : [Rust](https://www.rust-lang.org/tools/install) (`rustup`) + Xcode CLT (macOS)

## Installation

```bash
npm install
npm run dev
```

Build / aperçu production :

```bash
npm run build
npm run preview
```

### App desktop (Tauri)

```bash
# une fois : installer Rust (rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

npm run tauri:dev     # fenêtre native + hot reload Vite
npm run tauri:build   # installateur (.dmg / .msi / …)
```

### Release desktop (CI GitHub)

Le workflow [`.github/workflows/publish-tauri.yml`](.github/workflows/publish-tauri.yml) build **macOS** (Apple Silicon + Intel), **Windows** et **Linux**, puis crée une **draft Release** avec les installateurs en assets.

Déclencheurs :
- Actions → **Publish Tauri** → Run workflow
- ou tag : `git tag v0.1.0 && git push origin v0.1.0`

Prérequis GitHub : Settings → Actions → General → Workflow permissions → **Read and write**.

## Modules

| Onglet | Rôle |
|--------|------|
| **Google Docs** | Notes markdown locales, import Google Docs, sync de contenu, aperçu, plan |
| **Anki** | Decks, tags, révision SRS, import/export TSV `.txt`, génération IA depuis un document, déduplication, envoi vers onglet JetPunk |
| **JetPunk** | Listes catégorisées, alias de réponses, quiz chronométré, stats d’oublis, historique, import/export JSON, envoi vers onglet Anki |
| **Quizypedia** | Placeholder (activable dans Paramètres → Modules) |
| **Plateau** | Quiz IA (QCM, libre, vrai/faux, liste) à partir de docs, decks Anki et/ou listes JetPunk ; difficulté, anti-répétition, historique, sons optionnels |
| **Paramètres** | Clé API + vérification modèle Gemini, thème, modules, sons, **sauvegarde complète** |

## Données & sauvegarde

- Les données (docs, cartes, listes, historiques, réglages, clé API) restent sur **cet appareil / ce navigateur** -> un autre profil, autre machine ou mode privé = état vide.
- **Sauvegarde Hub des Savoirs** (Paramètres) : export / restauration via JSON.
- **GitHub Pages** : même modèle local ; le site hébergé ne lit ni n’écrit rien côté serveur.

## Arborescence du projet

<pre>
hub-des-savoirs/
├── .github/workflows/deploy.yml        # Déploiement GitHub Pages (CI)
├── index.html                          # Page principale
├── package.json                        # Dépendances
├── vite.config.ts                      # base Pages ou / (Tauri), alias @/
├── tailwind.config.cjs                 # Configuration Tailwind
├── src-tauri/                          # Shell desktop Tauri 2
├── public/                             # Ressources statiques
│   └── favicon.svg                     # Favicon
└── src/                                # Code source
    ├── main.tsx                       # Entrée principale React
    ├── App.tsx                        # Wrapper d’application principal
    ├── index.css
    ├── app/                           # Shell, sidebar, aide, navigation, layout
    │   ├── AppShell.tsx
    │   ├── Sidebar.tsx
    │   ├── nav-intent.ts
    │   ├── components/
    │   └── lib/
    ├── components/ui/                 # Primitives UI, boutons, inputs…
    ├── features/
    │   ├── docs/                      # Notes, Google Docs, imports texte
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── lib/
    │   ├── anki/                      # Decks, SRS, import/export, IA
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── lib/
    │   ├── jetpunk/                   # Listes JetPunk, quiz, stats
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── lib/
    │   ├── plateau/                   # Quiz IA Gemini (QCM, vrai/faux, etc.)
    │   │   ├── components/
    │   │   └── lib/
    │   ├── quizypedia/                # (placeholder, désactivable)
    │   └── settings/                  # Clé API, thèmes, sauvegarde, modules
    ├── lib/                           # utilitaires (stockage, gemini, backup…)
    ├── store/                         # State global (context, actions, reducer)
    └── types/                         # Types partagés (TypeScript)

</pre>


</details>

## Licence

Usage personnel / projet pédagogique.
