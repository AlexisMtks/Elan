# 🚀 Init.md — Journal d’initialisation du projet Élan

Ce fichier documente toutes les étapes d’initialisation du projet **Élan**, la plateforme d’achat et revente de matériel de gymnastique artistique.  
> ⚠️ La création de la **clé SSH** elle-même n’est pas incluse ici.

---

## 🏁 0. Création du dépôt GitHub

- Création du dépôt **privé/perso** `Elan` sur GitHub, sur le compte **`AlexisMtks`**.
- URL du dépôt : [https://github.com/AlexisMtks/Elan](https://github.com/AlexisMtks/Elan)
- Contenu initial : uniquement `README.md` généré automatiquement.

---

## 📂 1. Création du dossier projet en local
**Sur l'invite de commande (cmd)**

Chemin principal :  
`C:\Users\Alexis Mtks\Documents\Anais`

Création du dossier du projet :

```powershell
cd "C:\Users\Alexis Mtks\Documents\Anais"
mkdir elan
cd elan
```

> 💡 Une première tentative dans le dossier `Anais` a échoué :  
> `"Could not create a project called 'Anais' because of npm naming restrictions"`  
> → Next.js interdit les majuscules dans le nom du projet.

---

## 🏗️ 2. Initialisation du projet Next.js
**Selectionner le dossier 'elan' avec WebStorm**

**Désormais tout se fera depuis WebStorm**

Exécution depuis `C:\Users\Alexis Mtks\Documents\Anais\elan` :

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Choix pendant l’installation :**
- `Would you like to use React Compiler?` → No  
- `Would you like to use Turbopack? (recommended)` → No

**Résultat :**
- Création du projet Next.js 16 avec :
  - TypeScript
  - TailwindCSS
  - ESLint
  - App Router (`src/app`)
  - Alias `@/*`
- Installation automatique des dépendances (npm)
- Initialisation Git automatique (`git init` + premier commit auto).

---

## 🧪 3. Vérification du serveur de développement

Commande :

```bash
npm run dev
```

Sortie observée :

```
▲ Next.js 16.0.1 (webpack)
- Local:   http://localhost:3000
- Network: http://10.5.0.2:3000
✓ Ready in 2.3s
```

✅ Page d’accueil Next.js accessible sur `http://localhost:3000`.

⚠️ Avertissement affiché :
```
Warning: Next.js inferred your workspace root, but it may not be correct.
Detected additional lockfiles:
  * C:\Users\Alexis Mtks\package-lock.json
```
Non bloquant. Cela arrive s'il y a un ```package-lock.json``` dans un dossier supérieur.

---

## 🎨 4. Installation et configuration de `shadcn/ui`

Initialisation via la CLI moderne :

```bash
npx shadcn@latest init
```

**Options :**
- Framework détecté : Next.js ✅
- Tailwind détecté : v4 ✅
- Couleur de base : Neutral
- App Router : oui
- Composants dans : `src/components`
- Utilitaires : `src/lib`

Fichiers créés / modifiés :
- `components.json`
- `src/lib/utils.ts`
- `src/app/globals.css` (variables CSS)
- `tailwind.config.ts` (config mise à jour)

Message final :
```
Success! Project initialization completed.
You may now add components.
```

---

## 🧩 5. Ajout du premier composant `Button`

Ajout du composant depuis la registry shadcn :

```bash
npx shadcn@latest add button
```

Fichier ajouté :  
`src/components/ui/button.tsx`

---

## 🧪 6. Test du composant sur la page d’accueil

### Étape 1 — Ajout du bouton ```page.tsx```
```tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <h1 className="mb-6 text-4xl font-bold">Élan – MVP</h1>
      <Button onClick={() => alert("Action simulée ✨")}>
        Bouton shadcn/ui
      </Button>
    </main>
  );
}
```

### Étape 2 — Erreur rencontrée
```
Error: Event handlers cannot be passed to Client Component props.
```
Cause : la page est un **Server Component**.

### Étape 3 — Correction
Ajout de `"use client";` en haut du fichier :

```tsx
"use client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <h1 className="mb-6 text-4xl font-bold">Élan – MVP</h1>
      <Button onClick={() => alert("Action simulée ✨")}>
        Bouton shadcn/ui
      </Button>
    </main>
  );
}
```

✅ Le bouton fonctionne avec un `alert()` simulant l’action.

---

## 🧪 7. Vérification du serveur de développement

Commande :

```bash
npm run dev
```

Sortie observée :

```
elan@0.1.0 dev
next dev --webpack

   ▲ Next.js 16.0.1 (webpack)
   - Local:        http://localhost:3000
   - Network:      http://10.5.0.2:3000

✓ Starting...
✓ Ready in 3.2s
○ Compiling / ...
GET / 200 in 5.0s (compile: 4.7s, render: 304ms)
```

✅ Page d’accueil Next.js accessible sur `http://localhost:3000`.

⚠️ Avertissement affiché :
```
Warning: Next.js inferred your workspace root, but it may not be correct.
Detected additional lockfiles:
  * C:\Users\Alexis Mtks\package-lock.json
```
Non bloquant. Cela arrive s'il y a un ```package-lock.json``` dans un dossier supérieur.

---

## 🧹 8. Configuration du `.gitignore`

Ajout de la configuration locale IDE à ignorer (à la fin de ```.gitignore```) :

```gitignore
#IDE
.idea/
```

---

## 🔗 9. Liaison au dépôt GitHub perso (SSH)

Vérification du statut Git :

```bash
git status
git remote -v
```

Ajout du dépôt distant via **SSH** :

```bash
git remote add origin git@github.com-perso:AlexisMtks/Elan.git
```

Configuration du fichier SSH `~/.ssh/config` :

```text
Host github.com-perso
  HostName github.com
  User git
  IdentityFile "C:/Users/Alexis Mtks/.ssh/id_ed25519_github_perso"
  IdentitiesOnly yes
```

Test SSH :  
```bash
ssh -T git@github.com-perso
# → Hi AlexisMtks! You've successfully authenticated.
```

---

## 🧩 10. Harmonisation des branches `master` et `main`

Par défaut, `create-next-app` a créé la branche locale **`master`**, tandis que GitHub avait déjà une branche **`main`** (avec le `README.md` d’origine).  
Après un premier push sur `master`, la décision a été prise d’aligner le projet sur la convention moderne `main`.

### Étapes réalisées :

1. **Renommer la branche locale `master` en `main` :**

   ```bash
   git branch -M main
   ```

2. **Vérifier la branche actuelle :**

   ```bash
   git branch
   # * main
   ```

3. **Premier push tenté :**

   ```bash
   git push -u origin main
   ```

   Refusé avec :

   ```text
   ! [rejected]        main -> main (fetch first)
   Updates were rejected because the remote contains work that you do not have locally.
   ```

   Ce message indique que la branche distante `origin/main` (avec le README initial) avait un historique différent de la branche locale `main`.

4. **Forcer la mise à jour de `origin/main` avec l’historique local :**

   ```bash
   git push -u origin main --force
   ```

   Sortie observée :

   ```text
   Enumerating objects: 26, done.
   Counting objects: 100% (26/26), done.
   Delta compression using up to 12 threads
   Compressing objects: 100% (25/25), done.
   Writing objects: 100% (26/26), 63.73 KiB | 725.00 KiB/s, done.
   Total 26 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
   To github.com-perso:AlexisMtks/Elan.git
    + b1898a6...85ed950 main -> main (forced update)
   branch 'main' set up to track 'origin/main'.
   ```

✅ Résultat :  
La branche distante `main` contient désormais **tout le projet local**, et remplace l’ancien historique (README seul).

5. **Tentative de suppression de la branche distante `master` :**

   ```bash
   git push origin --delete master
   ```

   Sortie :

   ```text
   error: unable to delete 'master': remote ref does not exist
   error: failed to push some refs to 'github.com-perso:AlexisMtks/Elan.git'
   ```

   → Cela signifie simplement qu’il **n’y avait pas de branche `master` distante** au moment de la commande (elle n’existait que localement avant le renommage).  
   Aucune action supplémentaire n’était nécessaire.

---

## 💾 11. Commit d’initialisation (état stable)

À ce stade :
- Next.js + Tailwind + shadcn/ui sont installés
- le composant `Button` est fonctionnel
- `.idea/` est ignoré
- la branche locale et distante principale est `main`

Un commit d’initialisation propre a été réalisé (exemple) :

```bash
git add .
git commit -m "chore: init Next.js + Tailwind + shadcn/ui setup"
git push -u origin main --force
```

> ℹ️ Le `--force` permet de s’assurer que la branche distante `main` reflète exactement l’état local courant, en écrasant l’historique précédent (README seul).

## 🧼 11.1 Nettoyage du dépôt : suppression du dossier `.idea` déjà versionné

Lors de l’initialisation automatique de Next.js, le dossier `.idea/` (config WebStorm) a été **poussé dans le premier commit**  
(`Initial commit from Create Next App`) avant l’ajout du `.gitignore`.  
Il faut donc le **retirer proprement du suivi Git** sans le supprimer localement.

### Étapes réalisées :

1. **Supprimer le dossier du suivi Git (sans le supprimer du disque) :**
   ```bash
   git rm -r --cached .idea
   ```

2. **Committer la suppression :**
   ```bash
   git commit -m "chore: remove .idea from tracking"
   ```

3. **Pousser les modifications vers GitHub :**
   ```bash
   git push
   ```

✅ **Résultat attendu :**
- Le dossier `.idea` n’apparaît plus sur GitHub.
- Il reste présent localement pour WebStorm.
- Il est désormais ignoré dans tous les futurs commits.

## 🧼 11.2 Push de `Init.md`

On vient push ce fichier (non obligatoire) :

```bash
git add Init.md
git commit -m "docs: add init journal"
git push
```

---

## ✅ État final

| Élément | État |
|----------|------|
| Dossier local `elan` | ✔️ Créé |
| Projet Next.js | ✔️ Initialisé |
| TailwindCSS | ✔️ Configuré |
| shadcn/ui | ✔️ Installé |
| Premier composant (`Button`) | ✔️ Fonctionnel |
| `.gitignore` | ✔️ Ajouté |
| Remote GitHub perso SSH | ✔️ Configuré |
| Branche principale | ✔️ `main` (local + distant) |
| Push initial | ✔️ Effectué avec mise à jour forcée de `main` |