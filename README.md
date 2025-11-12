# 🦅 Élan — Plateforme d’achat & revente de matériel de gymnastique artistique

**Élan** est une plateforme moderne permettant aux passionnés de gymnastique de **vendre, acheter et échanger du matériel**.  
Le projet est construit avec **Next.js 16**, **TypeScript**, **TailwindCSS**, **shadcn/ui** et **Supabase** pour la gestion de l’authentification et des données.

---

## 🚀 Fonctionnalités principales

### 🧍‍♂️ Authentification (Supabase)
- Création de compte (`/register`)
- Connexion / déconnexion (`/login`, `/logout`)
- Gestion sécurisée de la session utilisateur côté client
- Redirection automatique :
    - vers `/login` si l’utilisateur n’est pas connecté
    - vers `/account` s’il est déjà connecté et tente d’accéder à `/login` ou `/register`

### 👤 Espace personnel
- Page **Mon compte** (`/account`)
    - Affichage et édition du profil (nom, prénom, ville, pays, adresse, bio, genre, etc.)
    - Changement d’avatar
    - Modification du mot de passe (simulation)

### 🏷️ Gestion des annonces
- Création, édition et suppression d’annonces (à venir)
- Visualisation publique du détail d’une annonce

### 💬 Messagerie intégrée
- Page **Messages** (`/messages`)
    - Liste des conversations (par produit)
    - Affichage des messages échangés
    - Simulation d’envoi de message
- Accès restreint : nécessite d’être connecté

### 🛒 Espace ventes & achats
- Pages protégées (`/sales`, `/purchases`)
- Accès limité aux utilisateurs authentifiés

---

## 🧠 Stack technique

| Technologie | Usage |
|--------------|--------|
| **Next.js 16 (App Router)** | Framework principal |
| **TypeScript** | Typage statique |
| **TailwindCSS** | Système de styles |
| **shadcn/ui** | Composants UI réutilisables |
| **Supabase** | Authentification + Base de données PostgreSQL |
| **Vercel** | Hébergement et CI/CD |

---

## ⚙️ Installation locale

### 1. Cloner le dépôt
```bash
git clone git@github.com-perso:AlexisMtks/Elan.git
cd Elan
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d’environnement
Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```
➡️ Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 🧱 Structure du projet

```
src/
 ├── app/
 │   ├── account/        → page "Mon compte"
 │   ├── login/          → page de connexion
 │   ├── register/       → page d'inscription
 │   ├── messages/       → messagerie utilisateur
 │   ├── purchases/      → mes achats
 │   ├── sales/          → mes ventes
 │   ├── publications/   → mes publications
 │   └── layout.tsx      → layout principal
 │
 ├── components/
 │   ├── account/        → formulaires compte/login/register
 │   ├── ui/             → composants shadcn (Button, Card, Input, etc.)
 │   └── misc/           → éléments transversaux (titre de page, etc.)
 │
 ├── hooks/
 │   ├── use-require-auth.ts       → protection des pages
 │   └── use-redirect-if-auth.ts   → redirection si déjà connecté
 │
 ├── lib/
 │   └── supabaseClient.ts         → instance Supabase
 │
 └── styles/
     └── globals.css               → styles Tailwind globaux
```

---

## 🔒 Sécurisation

- **Pages protégées** : `/account`, `/sales`, `/purchases`, `/publications`, `/messages`
  → via le hook `useRequireAuth()`
- **Redirection automatique** si non connecté → `/login`
- **Pages publiques protégées** : `/login`, `/register`
  → via `useRedirectIfAuth()` pour rediriger un utilisateur déjà connecté vers `/account`

---

## 🧩 Base de données Supabase

### Table `auth.users`
- Utilisateurs gérés automatiquement par Supabase Auth.

### Table `profiles`
- Remplie automatiquement via un **trigger SQL** lors de la création d’un utilisateur.
- Champs typiques :  
  `username`, `first_name`, `last_name`, `gender`, `address`, `postal_code`, `city`, `country`, `bio`, `phone_number`, `avatar_url`.

### Table `conversations` & `messages`
- Gestion des discussions entre acheteurs et vendeurs.
- Relations :
    - `buyer_id` & `seller_id` liés à `profiles.id`
    - `listing_id` lié à `listings.id`

---

## 🧭 Règles & conventions du projet

### ✍️ Convention de nommage
| Élément | Règle |
|----------|--------|
| **Composants React** | PascalCase (`AccountForm.tsx`, `LoginForm.tsx`) |
| **Hooks** | camelCase précédé de `use` (`useRequireAuth.ts`) |
| **Fichiers utilitaires** | camelCase (`supabaseClient.ts`) |
| **Dossiers** | kebab-case (`account`, `messages`, `misc`) |
| **Variables** | camelCase (`userEmail`, `loadingState`) |
| **Types & Interfaces** | PascalCase (`UserProfile`, `Conversation`) |

---

### 🧱 Structure & style du code

- Tous les composants client utilisent `"use client";` en tête de fichier.
- Chaque composant exporte **une seule fonction principale** (`export function Xyz()`).
- Toujours **préférer les fonctions fléchées locales** pour les callbacks (`const handleSubmit = (e) => {}`).
- **TailwindCSS** uniquement pour le styling (pas de fichiers CSS isolés sauf global).
- **UI components** (Button, Card, Input…) toujours importés depuis `@/components/ui/...`
- **Jamais de logique Supabase dans un composant UI** : les appels DB se font dans les pages ou dans les hooks.
- **Pas de console.log** en production → utiliser `console.error` pour les erreurs gérées.

---

### 🧩 Hooks maison

#### `useRequireAuth()`
- Bloque l’accès à une page si l’utilisateur n’est pas connecté.
- Retourne `{ user, checking }`.

#### `useRedirectIfAuth()`
- Empêche un utilisateur connecté d’accéder aux pages `/login` et `/register`.

---

### 💬 Git & conventions de commits

- Chaque commit est **atomique** et décrit **une seule modification cohérente**.
- Convention :
  ```
  type(scope): description
  ```
  Exemples :
  ```
  feat(auth): ajoute la redirection automatique après connexion
  fix(messages): corrige l’affichage de la dernière conversation
  refactor(account): simplifie la logique du formulaire de profil
  docs(readme): mise à jour des règles de code
  ```

---

## 🧾 Commandes utiles

| Commande | Description |
|-----------|-------------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Démarrer le serveur Next en mode prod |
| `npx shadcn@latest add <component>` | Ajouter un composant UI |
| `npm run lint` | Vérifier le style du code |

---

## 🚀 Déploiement (Vercel)

Déploiement automatique à chaque **push sur `main`**.  
Aucune configuration manuelle nécessaire.  
Vercel exécute :

```bash
npm install
npm run build
```

---

## 🧑‍💻 Prochaines évolutions

- ✅ Auth complète avec Supabase
- ✅ Pages sécurisées
- ✅ Gestion profil utilisateur
- ✅ Messagerie basique
- 🔜 Envoi réel de messages via Supabase Realtime
- 🔜 Gestion des annonces CRUD
- 🔜 Paiement / commandes
- 🔜 Notifications en temps réel

---

## 📝 Licence
Projet à usage privé (non encore publié sous licence).  
© 2025 – **Élan**, par *AlexisMtks*.

---

## 🤝 Contributeurs
- **Alexis Mtks** — Développeur principal / intégration UI
- **ChatGPT (GPT-5)** — Support technique & documentation
